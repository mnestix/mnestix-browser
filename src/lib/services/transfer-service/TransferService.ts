import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { base64ToBlob, encodeBase64 } from 'lib/util/Base64Util';
import {
    AssetAdministrationShell,
    AssetKind,
    Blob,
    File,
    ISubmodelElement,
    KeyTypes,
    Submodel,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { isValidUrl } from 'lib/util/UrlUtil';
import { AttachmentDetails, TransferDto, TransferResult } from 'lib/types/TransferServiceData';
import { getKeyType } from 'lib/util/KeyTypeUtil';
import { generateRandomId } from 'lib/util/RandomUtils';
import { isSuccessWithFile } from 'lib/util/apiResponseWrapper/apiResponseWrapperUtil';
import { ApiResponseWrapperError } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class TransferService {
    private constructor(
        protected readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly sourceAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly targetSubmodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly sourceSubmodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly targetAasDiscoveryClient?: IDiscoveryServiceApi,
        protected readonly targetAasRegistryClient?: IRegistryServiceApi,
        protected readonly targetSubmodelRegistryClient?: ISubmodelRegistryServiceApiInterface,
    ) {}

    static create(
        targetAasRepositoryBaseUrl: string,
        targetSubmodelRepositoryBaseUrl: string,
        targetAasDiscoveryBaseUrl?: string,
        targetAasRegistryBaseUrl?: string,
        targetSubmodelRegistryBaseUrl?: string,
        sourceAasRepositoryBaseUrl?: string | null,
    ): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create(
            mnestixFetch(),
            undefined,
            targetAasRepositoryBaseUrl,
        );

        const sourceAasRepositoryClient = AssetAdministrationShellRepositoryApi.create(
            mnestixFetch(),
            undefined,
            sourceAasRepositoryBaseUrl ?? process.env.AAS_REPO_API_URL,
        );

        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.create(
            mnestixFetch(),
            undefined,
            targetSubmodelRepositoryBaseUrl,
        );

        const sourceSubmodelRepositoryClient = SubmodelRepositoryApi.create(
            mnestixFetch(),
            undefined,
            sourceAasRepositoryBaseUrl ?? process.env.SUBMODEL_REPO_API_URL,
        );

        const targetAasDiscoveryClient = targetAasDiscoveryBaseUrl
            ? DiscoveryServiceApi.create(targetAasDiscoveryBaseUrl, mnestixFetch())
            : undefined;

        const targetAasRegistryClient = targetAasRegistryBaseUrl
            ? RegistryServiceApi.create(targetAasRegistryBaseUrl, mnestixFetch())
            : undefined;

        const targetSubmodelRegistryClient = targetSubmodelRegistryBaseUrl
            ? SubmodelRegistryServiceApi.create(targetSubmodelRegistryBaseUrl, mnestixFetch())
            : undefined;

        return new TransferService(
            targetAasRepositoryClient,
            sourceAasRepositoryClient,
            targetSubmodelRepositoryClient,
            sourceSubmodelRepositoryClient,
            targetAasDiscoveryClient,
            targetAasRegistryClient,
            targetSubmodelRegistryClient,
        );
    }

    async transferAasWithSubmodels({
        aas,
        originalAasId,
        submodels,
        apikey,
        targetAasRepositoryBaseUrl,
        targetSubmodelRepositoryBaseUrl,
    }: TransferDto): Promise<TransferResult[]> {
        const submodelDescriptors = submodels.map((transferSubmodel) =>
            this.createSubmodelDescriptorFromSubmodel(transferSubmodel.submodel, targetSubmodelRepositoryBaseUrl),
        );
        const shellDescriptor = this.createShellDescriptorFromAas(aas, targetAasRepositoryBaseUrl, submodelDescriptors);

        const promises = [];
        const attachmentPromises: Promise<TransferResult>[] = [];

        promises.push(this.postAasToRepository(aas, apikey));

        if (this.aasThumbnailImageIsFile(aas)) {
            attachmentPromises.push(this.putThumbnailImageToShell(originalAasId, aas.id, apikey));
        }

        if (this.targetAasDiscoveryClient && aas.assetInformation.globalAssetId) {
            promises.push(this.registerAasAtDiscovery(aas, apikey));
        }

        if (this.targetAasRegistryClient) {
            promises.push(this.registerAasAtRegistry(shellDescriptor));
        }

        for (const transferSubmodel of submodels) {
            promises.push(this.postSubmodelToRepository(transferSubmodel.submodel, apikey));

            if (transferSubmodel.submodel.submodelElements) {
                const attachmentDetails = this.getSubmodelAttachmentsDetails(
                    transferSubmodel.submodel.submodelElements,
                );
                const result = await this.processAttachments(
                    transferSubmodel.originalSubmodelId,
                    transferSubmodel.submodel.id,
                    attachmentDetails,
                    apikey,
                );
                attachmentPromises.push(...result);
            }
        }

        if (this.targetSubmodelRegistryClient) {
            submodelDescriptors.forEach((descriptor) => {
                promises.push(this.registerSubmodelAtRegistry(descriptor));
            });
        }

        const mainResults = await Promise.all(promises);
        // Ensure AAS and submodels are fully transferred before initiating file uploads to prevent 'not-found' errors.
        // Azure’s hosted repository requires time to process newly uploaded AAS and submodels, so a temporary 5-second delay is applied.
        // TODO: Implement a dynamic readiness check to replace the fixed 5-second delay.
        const attachmentResults: TransferResult[] = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(Promise.all(attachmentPromises));
            }, 5000);
        });

        return [...mainResults, ...attachmentResults];
    }

    private async postAasToRepository(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        const response = await this.targetAasRepositoryClient.postAssetAdministrationShell(aas, {
            headers: {
                Apikey: apikey,
            },
        });
        if (response.isSuccess) {
            return { success: true, operationKind: 'AasRepository', resourceId: aas.id, error: '' };
        } else {
            return { success: false, operationKind: 'AasRepository', resourceId: aas.id, error: response.message };
        }
    }

    private async registerAasAtDiscovery(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        const response = await this.targetAasDiscoveryClient!.postAllAssetLinksById(
            aas.id,
            [
                {
                    name: 'globalAssetId',
                    value: aas.assetInformation.globalAssetId!,
                },
            ],
            apikey,
        );
        if (response.isSuccess) {
            return { success: true, operationKind: 'Discovery', resourceId: aas.id, error: '' };
        } else {
            return { success: false, operationKind: 'Discovery', resourceId: aas.id, error: response.message };
        }
    }

    private async registerAasAtRegistry(shellDescriptor: AssetAdministrationShellDescriptor): Promise<TransferResult> {
        const response = await this.targetAasRegistryClient!.postAssetAdministrationShellDescriptor(shellDescriptor);
        if (response.isSuccess) {
            return { success: true, operationKind: 'AasRegistry', resourceId: shellDescriptor.id, error: '' };
        } else {
            return {
                success: false,
                operationKind: 'AasRegistry',
                resourceId: shellDescriptor.id,
                error: response.message,
            };
        }
    }

    private async postSubmodelToRepository(submodel: Submodel, apikey?: string): Promise<TransferResult> {
        const response = await this.targetSubmodelRepositoryClient.postSubmodel(submodel, {
            headers: {
                Apikey: apikey,
            },
        });
        if (response.isSuccess) {
            return { success: true, operationKind: 'SubmodelRepository', resourceId: submodel.id, error: '' };
        } else {
            return {
                success: false,
                operationKind: 'SubmodelRepository',
                resourceId: submodel.id,
                error: response.message,
            };
        }
    }

    private async registerSubmodelAtRegistry(submodelDescriptor: SubmodelDescriptor): Promise<TransferResult> {
        const response = await this.targetSubmodelRegistryClient!.postSubmodelDescriptor(submodelDescriptor);
        if (response.isSuccess) {
            return { success: true, operationKind: 'SubmodelRegistry', resourceId: submodelDescriptor.id, error: '' };
        } else {
            return {
                success: false,
                operationKind: 'SubmodelRegistry',
                resourceId: submodelDescriptor.id,
                error: response.message,
            };
        }
    }

    private async putThumbnailImageToShell(
        originalAasId: string,
        targetAasId: string,
        apikey?: string,
    ): Promise<TransferResult> {
        const response = await this.sourceAasRepositoryClient.getThumbnailFromShell(originalAasId);
        if (isSuccessWithFile(response)) {
            const aasThumbnail = base64ToBlob(response.result, response.fileType);
            const fileName = ['thumbnail', generateRandomId()].join('');
            const pushResponse = await this.targetAasRepositoryClient.putThumbnailToShell(
                targetAasId,
                aasThumbnail,
                fileName,
                {
                    headers: {
                        Apikey: apikey,
                    },
                },
            );
            if (pushResponse.isSuccess) {
                return { success: true, operationKind: 'File transfer', resourceId: 'Thumbnail transfer.', error: '' };
            } else {
                return {
                    success: false,
                    operationKind: 'File transfer',
                    resourceId: 'Thumbnail transfer.',
                    error: pushResponse.message,
                };
            }
        } else {
            return {
                success: false,
                operationKind: 'File transfer',
                resourceId: 'Thumbnail transfer.',
                error: (response as ApiResponseWrapperError<Blob>).message,
            };
        }
    }

    private async processAttachments(
        originalSubmodelId: string,
        targetSubmodelId: string,
        attachmentDetails: AttachmentDetails[],
        apikey?: string,
    ) {
        const promises = [];

        for (const attachmentDetail of attachmentDetails) {
            const response = await this.sourceSubmodelRepositoryClient.getAttachmentFromSubmodelElement(
                originalSubmodelId,
                attachmentDetail.idShortPath,
            );
            if (isSuccessWithFile(response)) {
                attachmentDetail.file = base64ToBlob(response.result, response.fileType);
                attachmentDetail.fileName = [
                    attachmentDetail.fileName,
                    this.getExtensionFromFileType(attachmentDetail.file.type),
                ].join('.');
                promises.push(this.putAttachmentToSubmodelElement(targetSubmodelId, attachmentDetail, apikey));
            } else {
                promises.push(
                    Promise.resolve({
                        success: false,
                        operationKind: 'File transfer',
                        resourceId: [
                            originalSubmodelId,
                            attachmentDetail.idShortPath,
                            ' not found in source repository',
                        ].join(': '),
                        error: (response as ApiResponseWrapperError<Blob>).message,
                    } as TransferResult),
                );
            }
        }
        return promises;
    }

    private async putAttachmentToSubmodelElement(
        submodelId: string,
        attachment: AttachmentDetails,
        apikey?: string,
    ): Promise<TransferResult> {
        const response = await this.targetSubmodelRepositoryClient.putAttachmentToSubmodelElement(
            submodelId,
            attachment,
            {
                headers: {
                    Apikey: apikey,
                },
            },
        );
        if (response.isSuccess) {
            return {
                success: true,
                operationKind: 'File transfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: '',
            };
        } else {
            return {
                success: false,
                operationKind: 'File transfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: response.message,
            };
        }
    }

    createShellDescriptorFromAas(
        aas: AssetAdministrationShell,
        targetBaseUrl: string,
        submodelDescriptors?: SubmodelDescriptor[],
    ): AssetAdministrationShellDescriptor {
        const endpoint = this.createEndpointForDescriptor(aas, targetBaseUrl);
        return {
            id: aas.id,
            idShort: aas.idShort || undefined,
            description: aas.description || undefined,
            displayName: aas.displayName || undefined,
            extensions: aas.extensions || undefined,
            administration: aas.administration || undefined,
            assetKind: AssetKind[aas.assetInformation.assetKind] as 'Instance' | 'NotApplicable' | 'Type',
            assetType: aas.assetInformation.assetType || undefined,
            globalAssetId: aas.assetInformation.globalAssetId || undefined,
            endpoints: [endpoint],
            specificAssetIds: aas.assetInformation.specificAssetIds || undefined,
            submodelDescriptors: submodelDescriptors,
        };
    }

    createSubmodelDescriptorFromSubmodel(submodel: Submodel, targetBaseUrl: string): SubmodelDescriptor {
        const endpoint = this.createEndpointForDescriptor(submodel, targetBaseUrl);
        return {
            id: submodel.id,
            idShort: submodel.idShort || undefined,
            semanticId: submodel.semanticId == null ? undefined : submodel.semanticId,
            description: submodel.description || undefined,
            displayName: submodel.displayName || undefined,
            extensions: submodel.extensions || undefined,
            administration: submodel.administration || undefined,
            endpoints: [endpoint],
            supplementalSemanticId:
                submodel.supplementalSemanticIds == null ? undefined : submodel.supplementalSemanticIds,
        };
    }

    createEndpointForDescriptor(target: AssetAdministrationShell | Submodel, baseUrl: string): Endpoint {
        const targetEndpointUrl = this.getEndpointUrl(target, baseUrl);
        return {
            interface: this.getInterfaceString(target),
            protocolInformation: {
                endpointProtocol: 'HTTP',
                endpointProtocolVersion: ['1.1'],
                href: targetEndpointUrl.toString(),
                // securityAttributes: '',
                // subprotocol: ,
                // subprotocolBody,
                // subprotocolBodyEncoding,
            },
        };
    }

    getEndpointUrl(target: AssetAdministrationShell | Submodel, targetBaseUrl: string) {
        const subpath = target instanceof AssetAdministrationShell ? 'shells' : 'submodels';
        return new URL(`/${subpath}/${encodeBase64(target.id)}`, targetBaseUrl);
    }

    getInterfaceString(target: AssetAdministrationShell | Submodel): string {
        return target instanceof AssetAdministrationShell ? 'AAS-3.0' : 'SUBMODEL-3.0';
    }

    aasThumbnailImageIsFile(aas: AssetAdministrationShell): boolean {
        const thumbnailPath = aas.assetInformation.defaultThumbnail?.path;
        return !!(thumbnailPath && !isValidUrl(thumbnailPath));
    }

    private getSubmodelAttachmentsDetails(submodelElements: ISubmodelElement[] | null) {
        const submodelAttachmentsDetails: AttachmentDetails[] = [];
        for (const subEl of submodelElements as ISubmodelElement[]) {
            const idShort = subEl.idShort;
            if (idShort === null || idShort === undefined) continue;

            this.processSubmodelElement(subEl, idShort, submodelAttachmentsDetails);
        }
        return submodelAttachmentsDetails;
    }

    private getAttachmentsDetailsFromCollection(subElColl: SubmodelElementCollection, collectionIdShortPath: string) {
        const submodelAttachmentsDetails: AttachmentDetails[] = [];
        for (const subEl of subElColl.value as ISubmodelElement[]) {
            if (subEl.idShort === null || subEl.idShort === undefined) continue;
            const idShortPath = [collectionIdShortPath, subEl.idShort].join('.');

            this.processSubmodelElement(subEl, idShortPath, submodelAttachmentsDetails);
        }
        return submodelAttachmentsDetails;
    }

    private processSubmodelElement(
        subEl: ISubmodelElement,
        idShortPath: string,
        submodelAttachmentsDetails: AttachmentDetails[],
    ) {
        const modelType = getKeyType(subEl);
        if (modelType === KeyTypes.SubmodelElementCollection) {
            if (!(subEl as SubmodelElementCollection).value) return;
            submodelAttachmentsDetails.push(
                ...this.getAttachmentsDetailsFromCollection(subEl as SubmodelElementCollection, idShortPath),
            );
        }

        if (modelType === KeyTypes.Blob) {
            submodelAttachmentsDetails.push({
                idShortPath: idShortPath,
                fileName: [(subEl as Blob).idShort, generateRandomId()].join(''),
            });
        }

        if (modelType === KeyTypes.File) {
            submodelAttachmentsDetails.push({
                idShortPath: idShortPath,
                fileName: [(subEl as File).idShort, generateRandomId()].join(''),
            });
        }
    }

    private getExtensionFromFileType(fileType: string) {
        if (fileType === 'application/octet-stream') return '';
        return fileType.split(/[+/]/)[1];
    }
}
