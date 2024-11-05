import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { ISubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApi';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { AssetAdministrationShellDescriptor, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import {
    AssetAdministrationShell,
    Blob,
    File,
    ISubmodelElement,
    KeyTypes,
    Submodel,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { AttachmentDetails, TransferResult } from 'lib/types/TransferServiceData';
import { getKeyType } from 'lib/util/KeyTypeUtil';
import { generateRandomId } from 'lib/util/RandomUtils';
import {
    aasThumbnailImageIsFile,
    createShellDescriptorFromAas,
    createSubmodelDescriptorFromSubmodel,
} from 'lib/util/TransferUtil';

export enum ServiceReachable {
    Yes = 'Yes',
    No = 'No',
}

export class TransferService {
    private constructor(
        readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        readonly sourceAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        readonly targetSubmodelRepositoryClient: ISubmodelRepositoryApi,
        readonly sourceSubmodelRepositoryClient: ISubmodelRepositoryApi,
        readonly targetAasDiscoveryClient?: IDiscoveryServiceApi,
        readonly targetAasRegistryClient?: IRegistryServiceApi,
        readonly targetSubmodelRegistryClient?: ISubmodelRegistryServiceApi,
    ) {}

    static create(
        targetAasRepositoryBaseUrl: string,
        sourceAasRepositoryBaseUrl: string,
        targetSubmodelRepositoryBaseUrl: string,
        sourceSubmodelRepositoryBaseUrl: string,
        targetAasDiscoveryBaseUrl?: string,
        targetAasRegistryBaseUrl?: string,
        targetSubmodelRegistryBaseUrl?: string,
    ): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create(
            targetAasRepositoryBaseUrl,
            mnestixFetch(),
        );

        const sourceAasRepositoryClient = AssetAdministrationShellRepositoryApi.create(
            sourceAasRepositoryBaseUrl,
            mnestixFetch(),
        );

        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.create(
            targetSubmodelRepositoryBaseUrl,
            mnestixFetch(),
        );

        const sourceSubmodelRepositoryClient = SubmodelRepositoryApi.create(
            sourceSubmodelRepositoryBaseUrl,
            mnestixFetch(),
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

    static createNull(
        targetAasRepository: ServiceReachable = ServiceReachable.Yes,
        sourceAasRepository: ServiceReachable = ServiceReachable.Yes,
        sourceAasEntries: AssetAdministrationShell[] = [],
        targetSubmodelRepository: ServiceReachable = ServiceReachable.Yes,
        sourceSubmodelRepository: ServiceReachable = ServiceReachable.Yes,
        sourceSubmodelEntries: Submodel[] = [],
        targetAasDiscovery?: ServiceReachable,
        targetAasRegistry?: ServiceReachable,
        targetSubmodelRegistry?: ServiceReachable,
    ): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.createNull(
            'https://targetAasRepositoryClient.com',
            [],
            targetAasRepository,
        );

        const sourceAasRepositoryClient = AssetAdministrationShellRepositoryApi.createNull(
            'https://sourceAasRepositoryClient.com',
            sourceAasEntries,
            sourceAasRepository,
        );

        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.createNull(
            'https://targetSubmodelRepositoryClient.com',
            [],
            targetSubmodelRepository,
        );

        const sourceSubmodelRepositoryClient = SubmodelRepositoryApi.createNull(
            'https://sourceSubmodelRepositoryClient.com',
            sourceSubmodelEntries,
            sourceSubmodelRepository,
        );

        const targetAasDiscoveryClient = targetAasDiscovery
            ? DiscoveryServiceApi.createNull('https://targetDiscoveryClient.com', [], targetAasDiscovery)
            : undefined;

        const targetAasRegistryClient = targetAasRegistry
            ? RegistryServiceApi.createNull('https://targetAasRegistryClient.com', [], [], targetAasRegistry)
            : undefined;

        const targetSubmodelRegistryClient = targetSubmodelRegistry
            ? SubmodelRegistryServiceApi.createNull(
                  'https://targetSubmodelRegistryClient.com',
                  [],
                  targetSubmodelRegistry,
              )
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

    async transferAasWithSubmodels(
        aas: AssetAdministrationShell,
        submodels: Submodel[],
        apikey?: string,
    ): Promise<TransferResult[]> {
        const submodelDescriptors = submodels.map((submodel) =>
            createSubmodelDescriptorFromSubmodel(submodel, this.targetAasRepositoryClient.getBaseUrl()),
        );
        const shellDescriptor = createShellDescriptorFromAas(
            aas,
            this.targetAasRepositoryClient.getBaseUrl(),
            submodelDescriptors,
        );

        const promises = [];

        promises.push(this.postAasToRepository(aas, apikey));

        if (aasThumbnailImageIsFile(aas)) {
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

    private async putThumbnailImageToShell(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        const response = await this.sourceAasRepositoryClient.getThumbnailFromShell(aas.id);
        if (response.isSuccess) {
            const aasThumbnail = response.result;
            const fileName = ['thumbnail', generateRandomId()].join('');
            await this.targetAasRepositoryClient.putThumbnailToShell(aas.id, aasThumbnail, fileName, {
                headers: {
                    Apikey: apikey,
                },
            });
            return { success: true, operationKind: 'AasRepository', resourceId: 'Thumbnail transfer.', error: '' };
        } else {
            return {
                success: false,
                operationKind: 'AasRepository',
                resourceId: 'Thumbnail transfer.',
                error: response.message,
            };
        }
    }

    private async processAttachments(submodelId: string, attachmentDetails: AttachmentDetails[], apikey?: string) {
        const promises = [];

        for (const attachmentDetail of attachmentDetails) {
            const response = await this.sourceSubmodelRepositoryClient.getAttachmentFromSubmodelElement(
                submodelId,
                attachmentDetail.idShortPath,
            );
            if (response.isSuccess) {
                attachmentDetail.file = response.result;
                attachmentDetail.fileName = [
                    attachmentDetail.fileName,
                    this.getExtensionFromFileType(attachmentDetail.file.type),
                ].join('.');
                promises.push(this.putAttachmentToSubmodelElement(submodelId, attachmentDetail, apikey));
            } else {
                promises.push(
                    Promise.resolve({
                        success: false,
                        operationKind: 'FileTransfer',
                        resourceId: [submodelId, attachmentDetail.idShortPath, ' not found in source repository'].join(
                            ': ',
                        ),
                        error: response.message,
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
                operationKind: 'FileTransfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: '',
            };
        } else {
            return {
                success: false,
                operationKind: 'FileTransfer',
                resourceId: [submodelId, attachment.idShortPath].join(': '),
                error: response.message,
            };
        }
    }

    private async registerAasAtDiscovery(aas: AssetAdministrationShell): Promise<TransferResult> {
        const response = await this.targetAasDiscoveryClient!.linkAasIdAndAssetId(
            aas.id,
            aas.assetInformation.globalAssetId!,
        );
        if (response.isSuccess) {
            return { success: true, operationKind: 'Discovery', resourceId: aas.id, error: '' };
        } else {
            return { success: false, operationKind: 'Discovery', resourceId: aas.id, error: response.message };
        }
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
        if (!(subEl as SubmodelElementCollection).value) return;
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
