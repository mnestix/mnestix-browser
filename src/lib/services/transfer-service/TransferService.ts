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
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    AssetAdministrationShell,
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
    ): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: targetAasRepositoryBaseUrl,
            fetch: mnestixFetch(),
        });

        const sourceAasRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: process.env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        });

        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: targetSubmodelRepositoryBaseUrl,
            fetch: mnestixFetch(),
        });

        const sourceSubmodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: process.env.SUBMODEL_REPO_API_URL,
            fetch: mnestixFetch(),
        });

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
        submodels,
        apikey,
        targetAasRepositoryBaseUrl,
        targetSubmodelRepositoryBaseUrl,
    }: TransferDto): Promise<TransferResult[]> {
        const submodelDescriptors = submodels.map((submodel) =>
            this.createSubmodelDescriptorFromSubmodel(submodel, targetSubmodelRepositoryBaseUrl),
        );
        const shellDescriptor = this.createShellDescriptorFromAas(aas, targetAasRepositoryBaseUrl, submodelDescriptors);

        const promises = [];

        promises.push(this.postAasToRepository(aas, apikey));

        if (this.aasThumbnailImageIsFile(aas)) {
            promises.push(this.putThumbnailImageToShell(aas, apikey));
        }

        if (this.targetAasDiscoveryClient && aas.assetInformation.globalAssetId) {
            promises.push(this.registerAasAtDiscovery(aas));
        }

        if (this.targetAasRegistryClient) {
            promises.push(this.registerAasAtRegistry(shellDescriptor));
        }

        for (const submodel of submodels) {
            promises.push(this.postSubmodelToRepository(submodel, apikey));

            if (submodel.submodelElements) {
                const attachmentDetails = this.getSubmodelAttachmentsDetails(submodel.submodelElements);
                const result = await this.processAttachments(submodel.id, attachmentDetails, apikey);
                promises.push(...result);
            }
        }

        if (this.targetSubmodelRegistryClient) {
            submodelDescriptors.forEach((descriptor) => {
                promises.push(this.registerSubmodelAtRegistry(descriptor));
            });
        }

        return await Promise.all(promises);
    }

    private async postAasToRepository(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        try {
            await this.targetAasRepositoryClient.postAssetAdministrationShell(aas, {
                headers: {
                    Apikey: apikey,
                },
            });
            return { success: true, operationKind: 'AasRepository', resourceId: aas.id, error: '' };
        } catch (e) {
            return { success: false, operationKind: 'AasRepository', resourceId: aas.id, error: e.toString() };
        }
    }

    private async registerAasAtDiscovery(aas: AssetAdministrationShell): Promise<TransferResult> {
        try {
            await this.targetAasDiscoveryClient!.postAllAssetLinksById(aas.id, [
                {
                    name: 'globalAssetId',
                    value: aas.assetInformation.globalAssetId!,
                },
            ]);
            return { success: true, operationKind: 'Discovery', resourceId: aas.id, error: '' };
        } catch (e) {
            return { success: false, operationKind: 'Discovery', resourceId: aas.id, error: e.toString() };
        }
    }

    private async registerAasAtRegistry(shellDescriptor: AssetAdministrationShellDescriptor): Promise<TransferResult> {
        try {
            await this.targetAasRegistryClient!.postAssetAdministrationShellDescriptor(shellDescriptor);
            return { success: true, operationKind: 'AasRegistry', resourceId: shellDescriptor.id, error: '' };
        } catch (e) {
            return {
                success: false,
                operationKind: 'AasRegistry',
                resourceId: shellDescriptor.id,
                error: e.toString(),
            };
        }
    }

    private async postSubmodelToRepository(submodel: Submodel, apikey?: string): Promise<TransferResult> {
        try {
            await this.targetSubmodelRepositoryClient.postSubmodel(submodel, {
                headers: {
                    Apikey: apikey,
                },
            });
            return { success: true, operationKind: 'SubmodelRepository', resourceId: submodel.id, error: '' };
        } catch (e) {
            return {
                success: false,
                operationKind: 'SubmodelRepository',
                resourceId: submodel.id,
                error: e.toString(),
            };
        }
    }

    private async registerSubmodelAtRegistry(submodelDescriptor: SubmodelDescriptor): Promise<TransferResult> {
        try {
            await this.targetSubmodelRegistryClient!.postSubmodelDescriptor(submodelDescriptor);
            return { success: true, operationKind: 'SubmodelRegistry', resourceId: submodelDescriptor.id, error: '' };
        } catch (e) {
            return {
                success: false,
                operationKind: 'SubmodelRegistry',
                resourceId: submodelDescriptor.id,
                error: e.toString(),
            };
        }
    }

    private async putThumbnailImageToShell(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        try {
            const aasThumbnail = await this.sourceAasRepositoryClient.getThumbnailFromShell(aas.id);
            const fileName = ['thumbnail', generateRandomId()].join('');
            await this.targetAasRepositoryClient.putThumbnailToShell(aas.id, aasThumbnail, fileName, {
                headers: {
                    Apikey: apikey,
                },
            });
            return { success: true, operationKind: 'AasRepository', resourceId: 'Thumbnail transfer.', error: '' };
        } catch (e) {
            return {
                success: false,
                operationKind: 'AasRepository',
                resourceId: 'Thumbnail transfer.',
                error: e.toString(),
            };
        }
    }

    private async processAttachments(submodelId: string, attachmentDetails: AttachmentDetails[], apikey?: string) {
        const promises = [];

        for (const attachmentDetail of attachmentDetails) {
            try {
                attachmentDetail.file = await this.sourceSubmodelRepositoryClient.getAttachmentFromSubmodelElement(
                    submodelId,
                    attachmentDetail.idShortPath,
                );
                attachmentDetail.fileName = [
                    attachmentDetail.fileName,
                    this.getExtensionFromFileType(attachmentDetail.file.type),
                ].join('.');
                promises.push(this.putAttachmentToSubmodelElement(submodelId, attachmentDetail, apikey));
            } catch (e) {
                promises.push(
                    Promise.resolve({
                        success: false,
                        operationKind: 'File transfer',
                        resourceId: [submodelId, attachmentDetail.idShortPath, ' not found in source repository'].join(
                            ': ',
                        ),
                        error: e.toString(),
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
        try {
            await this.targetSubmodelRepositoryClient.putAttachmentToSubmodelElement(submodelId, attachment, {
                headers: {
                    Apikey: apikey,
                },
            });
            return {
                success: true,
                operationKind: 'File transfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: '',
            };
        } catch (e) {
            return {
                success: false,
                operationKind: 'File transfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: e.toString(),
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
            assetKind: aas.assetInformation.assetKind,
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
            semanticId: submodel.semanticId,
            description: submodel.description || undefined,
            displayName: submodel.displayName || undefined,
            extensions: submodel.extensions || undefined,
            administration: submodel.administration || undefined,
            endpoints: [endpoint],
            supplementalSemanticId: submodel.supplementalSemanticIds,
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
        return fileType.split('/')[1];
    }
}
