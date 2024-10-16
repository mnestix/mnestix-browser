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
import { TransferDto, TransferResult } from 'lib/services/transfer-service/transferActions';
import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { isValidUrl } from 'lib/util/UrlUtil';

export class TransferService {
    private constructor(
        protected readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly sourceAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly targetSubmodelRepositoryClient: ISubmodelRepositoryApi,
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
            promises.push(this.postThumbnailImageToShell(aas, apikey));
        }

        if (this.targetAasDiscoveryClient && aas.assetInformation.globalAssetId) {
            promises.push(this.registerAasAtDiscovery(aas));
        }

        if (this.targetAasRegistryClient) {
            promises.push(this.registerAasAtRegistry(shellDescriptor));
        }

        submodels.forEach((submodel) => {
            promises.push(this.postSubmodelToRepository(submodel, apikey));
        });

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

    private async postThumbnailImageToShell(aas: AssetAdministrationShell, apikey?: string): Promise<TransferResult> {
        try {
            const aasThumbnail = await this.sourceAasRepositoryClient.getThumbnailFromShell(aas.id);
            await this.targetAasRepositoryClient.putThumbnailToShell(aas.id, aasThumbnail, {
                headers: {
                    Apikey: apikey,
                },
            });
            return { success: true, operationKind: 'AasRepository', resourceId: '', error: '' };
        } catch (e) {
            return {
                success: false,
                operationKind: 'AasRepository',
                resourceId: 'Thumbnail import failed.',
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
}
