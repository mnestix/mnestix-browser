import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Log } from 'lib/util/Log';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    NullableMultipleDataSourceSetupParameters,
    RepoSearchResult,
    RepositorySearchService,
} from 'lib/services/repository-access/RepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

interface NullableSearchSetupParameters {
    discoveryEntries?: { assetId: string; aasIds: string[] }[];
    registryShellDescriptorEntries?: AssetAdministrationShellDescriptor[] | null;
    shellsAvailableOnRegistryEndpoints?: { endpoint: URL; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepositories?: INullableAasRepositoryEntries[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    entitiesInMultipleDataSources?: NullableMultipleDataSourceSetupParameters | null;
    log?: Log | null;
}

export type AasData = {
    submodelDescriptors: SubmodelDescriptor[] | undefined;
    aasRegistryRepositoryOrigin: string | undefined;
};

export type AasSearchResult = {
    redirectUrl: string;
    aas: AssetAdministrationShell | null;
    aasData: AasData | null;
};

export type RegistrySearchResult = {
    endpoints: URL[];
    submodelDescriptors: SubmodelDescriptor[];
};

export class AasSearcher {
    private constructor(
        protected readonly discoveryServiceClient: IDiscoveryServiceApi,
        protected readonly registryService: IRegistryServiceApi,
        protected readonly multipleDataSource: RepositorySearchService,
        protected readonly log: Log,
    ) {}

    static create(): AasSearcher {
        const multipleDataSource = RepositorySearchService.create();
        const registryServiceClient = RegistryServiceApi.create(process.env.REGISTRY_API_URL, mnestixFetch());
        const discoveryServiceClient = DiscoveryServiceApi.create(process.env.DISCOVERY_API_URL, mnestixFetch());
        const log = Log.create();
        return new AasSearcher(discoveryServiceClient, registryServiceClient, multipleDataSource, log);
    }

    static createNull({
        discoveryEntries = [],
        registryShellDescriptorEntries = [],
        shellsAvailableOnRegistryEndpoints = [],
        shellsSavedInTheRepositories = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableSearchSetupParameters = {}): AasSearcher {
        return new AasSearcher(
            DiscoveryServiceApi.createNull({ discoveryEntries: discoveryEntries }),
            RegistryServiceApi.createNull({
                registryShellDescriptorEntries: registryShellDescriptorEntries,
                shellsAvailableOnEndpoints: shellsAvailableOnRegistryEndpoints,
            }),
            RepositorySearchService.createNull({
                shellsSavedInTheRepositories: shellsSavedInTheRepositories,
                submodelsSavedInTheRepository,
            }),
            log ?? Log.createNull(),
        );
    }

    async performFullSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
        const aasIds = await this.performAasDiscoverySearch(searchInput);
        const foundMultipleDiscoveryResults = aasIds && aasIds.length > 1;
        const foundOneDiscoveryResult = aasIds && aasIds.length === 1;

        if (foundMultipleDiscoveryResults) {
            return new ApiResponseWrapper<AasSearchResult>(this.createDiscoveryRedirectResult(searchInput));
        }

        const aasId = foundOneDiscoveryResult ? aasIds[0] : searchInput;
        const aasIdEncoded = encodeBase64(aasId);

        const aasRegistryResult = await this.performRegistrySearch(aasId);
        if (aasRegistryResult.isSuccess()) {
            return new ApiResponseWrapper<AasSearchResult>(aasRegistryResult.result);
        }

        const defaultResult = await this.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult) {
            return new ApiResponseWrapper<AasSearchResult>(this.createAasResult(defaultResult));
        }

        const potentiallyMultipleAas = await this.getAasFromAllRepositories(aasIdEncoded);
        if (potentiallyMultipleAas) {
            if (potentiallyMultipleAas.length === 1) {
                return new ApiResponseWrapper<AasSearchResult>(this.createAasResult(potentiallyMultipleAas[0].aas));
            }
            if (potentiallyMultipleAas.length > 1) {
                return new ApiResponseWrapper<AasSearchResult>(this.createDiscoveryRedirectResult(searchInput));
            }
        }
        return new ApiResponseWrapper<AasSearchResult>(null); // No AAS found for the given ID
    }

    // TODO: handle multiple endpoints as result
    public async performRegistrySearch(searchAasId: string): Promise<ApiResponseWrapper<AasSearchResult>> {
        const registrySearchResult = await this.performAasRegistrySearch(searchAasId);
        if (!registrySearchResult.isSuccess()) {
            return new ApiResponseWrapper<AasSearchResult>(null, registrySearchResult.errorCode);
        }
        const endpoint = registrySearchResult.result.endpoints[0];

        const aas = await this.getAasFromEndpoint(endpoint);
        if (!aas.isSuccess()) {
            return new ApiResponseWrapper<AasSearchResult>(null, aas.errorCode);
        }
        const data = {
            submodelDescriptors: registrySearchResult.result.submodelDescriptors,
            aasRegistryRepositoryOrigin: endpoint.origin,
        };
        return new ApiResponseWrapper<AasSearchResult>(this.createAasResult(aas.result, data));
    }

    public async performAasDiscoverySearch(searchAssetId: string): Promise<string[] | null> {
        try {
            return (await this.discoveryServiceClient.getAasIdsByAssetId(searchAssetId)).result;
        } catch (e) {
            this.log.warn(`Could not find the asset '${searchAssetId}' in the discovery service`);
            return null;
        }
    }

    public async getAasFromRepository(aasId: string, repoUrl: string): Promise<AssetAdministrationShell | null> {
        try {
            return await this.multipleDataSource.getAasFromRepo(aasId, repoUrl);
        } catch (e) {
            this.log.warn(`Could not find an AAS '${aasId}' in the repository '${repoUrl}'`);
            return null;
        }
    }

    private createAasResult(aas: AssetAdministrationShell, data?: AasData): AasSearchResult {
        return {
            redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
            aas: aas,
            aasData: data || null,
        };
    }

    private createDiscoveryRedirectResult(searchInput: string): AasSearchResult {
        return {
            redirectUrl: `/viewer/discovery?assetId=${searchInput}`,
            aas: null,
            aasData: null,
        };
    }

    private async performAasRegistrySearch(searchAasId: string): Promise<ApiResponseWrapper<RegistrySearchResult>> {
        try {
            const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
            const endpoints = shellDescription.endpoints as Endpoint[];
            const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];
            const endpointUrls = endpoints.map((endpoint) => new URL(endpoint.protocolInformation.href));
            return new ApiResponseWrapper<RegistrySearchResult>({
                endpoints: endpointUrls,
                submodelDescriptors: submodelDescriptors,
            });
        } catch (e) {
            this.log.warn(`Could not find the AAS '${searchAasId}' in the registry service`);
            return new ApiResponseWrapper<RegistrySearchResult>(null, e.errorCode);
        }
    }

    private async getAasFromEndpoint(endpoint: URL): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        try {
            const result = await this.registryService.getAssetAdministrationShellFromEndpoint(endpoint)
            return new ApiResponseWrapper<AssetAdministrationShell>(result);
        } catch (e) {
            this.log.warn(`Could not find an AAS at the endpoint '${endpoint}'`);
            return new ApiResponseWrapper<AssetAdministrationShell>(null, e.errorCode);
        }
    }

    private async getAasFromDefaultRepository(aasId: string): Promise<AssetAdministrationShell | null> {
        try {
            return await this.multipleDataSource.getAasFromDefaultRepository(aasId);
        } catch (e) {
            this.log.warn(`Could not find the AAS '${aasId}' in the default repository`);
            return null;
        }
    }

    private async getAasFromAllRepositories(aasId: string): Promise<RepoSearchResult[] | null> {
        try {
            return await this.multipleDataSource.getAasFromAllRepos(aasId);
        } catch (e) {
            this.log.warn(`Could not find the AAS '${aasId}' in any configured repository`);
            return null;
        }
    }
}
