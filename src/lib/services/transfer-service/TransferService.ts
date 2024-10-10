import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { AssetAdministrationShellDescriptor, Endpoint } from 'lib/types/registryServiceTypes';
import { TransferDto } from 'lib/services/transfer-service/transferActions';
import { encodeBase64 } from 'lib/util/Base64Util';

export class TransferService {
    private constructor(
        protected readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly targetAasRegistryClient: IRegistryServiceApi,
        protected readonly targetSubmodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly targetSubmodelRegistryClient: ISubmodelRegistryServiceApiInterface,
        protected readonly targetAasDiscoveryClient?: IDiscoveryServiceApi,
    ) {}

    static create(
        targetAasRepositoryBaseUrl: string,
        targetSubmodelRepositoryBaseUrl: string,
        targetAasDiscoveryBaseUrl?: string,
    ): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: targetAasRepositoryBaseUrl,
            fetch: mnestixFetch(),
        });
        const targetAasRegistryClient = RegistryServiceApi.create(process.env.REGISTRY_API_URL, mnestixFetch());

        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: process.env.SUBMODEL_REGISTRY_API_URL,
            fetch: mnestixFetch(),
        });
        const targetSubmodelRegistryClient = SubmodelRegistryServiceApi.create(
            targetSubmodelRepositoryBaseUrl,
            mnestixFetch(),
        );

        const targetAasDiscoveryClient = targetAasDiscoveryBaseUrl
            ? DiscoveryServiceApi.create(targetAasDiscoveryBaseUrl, mnestixFetch())
            : undefined;

        return new TransferService(
            targetAasRepositoryClient,
            targetAasRegistryClient,
            targetSubmodelRepositoryClient,
            targetSubmodelRegistryClient,
            targetAasDiscoveryClient,
        );
    }

    // TODO Update parameters
    async transferAasWithSubmodels({ aas, apikey, targetAasRepositoryBaseUrl }: TransferDto) {
        aas.id = aas.id + '_12_test';
        //1 post aas to repository
        await this.targetAasRepositoryClient.postAssetAdministrationShell(aas, {
            headers: {
                Apikey: apikey,
            },
        });

        //2 register aas to discovery service
        if (this.targetAasDiscoveryClient && aas.assetInformation.globalAssetId) {
            await this.targetAasDiscoveryClient.postAllAssetLinksById(aas.id, [
                {
                    name: 'globalAssetId',
                    value: aas.assetInformation.globalAssetId,
                },
            ]);
        }

        //3 register in AAS registry
        if (this.targetAasRegistryClient) {
            const aasEndpointUrl = this.getEndpointUrl(aas, targetAasRepositoryBaseUrl);
            const shellDescriptor = this.createShellDescriptorFromAas(aas, aasEndpointUrl);

            await this.targetAasRegistryClient.postAssetAdministrationShellDescriptor(shellDescriptor);
        }

        // for each submodel
        //#    post submodel to submodel repository (for now all into the same repository)
        //#    register submodel in the submodel registry
    }

    createShellDescriptorFromAas(
        aas: AssetAdministrationShell,
        aasEndpointUrl: URL,
    ): AssetAdministrationShellDescriptor {
        const endpoint = this.createEndpointForShellDescriptor(aasEndpointUrl);
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
            /*submodelDescriptors: shell.submodels ? this.createSubmodelDescriptors(shell.submodels) : undefined,*/
        };
    }

    createEndpointForShellDescriptor(aasEndpointUrl: URL): Endpoint {
        return {
            interface: 'AAS-3.0',
            protocolInformation: {
                endpointProtocol: 'HTTP',
                endpointProtocolVersion: ['1.1'],
                href: aasEndpointUrl.toString(),
                // securityAttributes: '',
                // subprotocol: ,
                // subprotocolBody,
                // subprotocolBodyEncoding,
            },
        };
    }

    getEndpointUrl(aas: AssetAdministrationShell, targetAasRepositoryBaseUrl: string) {
        return new URL(`/shells/${encodeBase64(aas.id)}`, targetAasRepositoryBaseUrl);
    }
}
