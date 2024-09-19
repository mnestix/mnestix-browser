import {
    AssetAdministrationShellDescriptor,
    Endpoint,
    RegistryAasData,
    SubmodelDescriptor,
} from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Log } from 'lib/util/Log';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    MultipleRepositorySearchService,
    NullableMultipleDataSourceSetupParameters,
} from 'lib/services/MultipleRepositorySearch/MultipleRepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';

interface NullableSearchSetupParameters {
    discoveryEntries?: { assetId: string; aasIds: string[] }[];
    registryShellDescriptorEntries?: AssetAdministrationShellDescriptor[] | null;
    shellsByRegistryEndpoint?: { endpoint: URL; aas: AssetAdministrationShell }[] | null;
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

export interface AasResult {
    registryAas: AssetAdministrationShell;
    registryAasData?: RegistryAasData;
}

export class AasSearcher {
    private constructor(
        protected readonly discoveryServiceClient: IDiscoveryServiceApi,
        protected readonly registryService: IRegistryServiceApi,
        protected readonly multipleDataSource: MultipleRepositorySearchService,
        protected readonly fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
        protected readonly log: Log,
    ) {}

    static create(_baseUrl: string = ''): AasSearcher {
        const multipleDataSource = MultipleRepositorySearchService.create();
        const registryServiceClient = RegistryServiceApi.create(process.env.REGISTRY_API_URL, mnestixFetch());
        const discoveryServiceClient = DiscoveryServiceApi.create(process.env.DISCOVERY_API_URL, mnestixFetch());
        const log = Log.create();
        return new AasSearcher(discoveryServiceClient, registryServiceClient, multipleDataSource, fetch, log);
    }

    static createNull({
        discoveryEntries = [],
        registryShellDescriptorEntries = [],
        shellsByRegistryEndpoint = [],
        shellsSavedInTheRepositories = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableSearchSetupParameters = {}): AasSearcher {
        const stubbedFetch = async (input: URL): Promise<Response> => {
            if (!shellsByRegistryEndpoint) return Promise.reject(new Error('no registry configuration'));
            for (const aasEntry of shellsByRegistryEndpoint) {
                if (aasEntry.endpoint.href === input.href) return new Response(JSON.stringify(aasEntry.aas));
            }
            return Promise.reject(new Error('no aas for on href:' + input));
        };
        return new AasSearcher(
            DiscoveryServiceApi.createNull({ discoveryEntries: discoveryEntries }),
            RegistryServiceApi.createNull({ registryShellDescriptorEntries }),
            MultipleRepositorySearchService.createNull({
                shellsSavedInTheRepositories: shellsSavedInTheRepositories,
                submodelsSavedInTheRepository,
            }),
            stubbedFetch,
            log ?? Log.createNull(),
        );
    }

    async fullSearch(searchInput: string): Promise<AasSearchResult> {
        const aasIds = await this.performAasDiscoverySearch(searchInput);
        const foundMultipleDiscoveryResults = aasIds && aasIds.length > 1;
        const foundOneDiscoveryResult = aasIds && aasIds.length === 1;

        if (foundMultipleDiscoveryResults) {
            return this.createDiscoveryRedirectResult(searchInput);
        }

        const aasId = foundOneDiscoveryResult ? aasIds[0] : searchInput;
        const aasIdEncoded = encodeBase64(aasId);

        // TODO: handle multiple endpoints as result
        const aasRegistryResult = await this.fetchFirstAasFromRegistrySearch(aasId);
        if (aasRegistryResult) {
            return aasRegistryResult;
        }

        const defaultResult = await this.multipleDataSource.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult) {
            return this.createAasResult(defaultResult);
        }

        const potentiallyMultipleAas = await this.multipleDataSource.getAasFromAllRepos(aasIdEncoded);
        if (potentiallyMultipleAas.length > 1) {
            return this.createDiscoveryRedirectResult(searchInput);
        }

        const aas = potentiallyMultipleAas[0].aas;
        return this.createAasResult(aas);
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

    /**
     * Resolves the given Asset ID using the discovery service.
     *
     * This function takes an Asset ID and attempts to resolve it using a discovery service.
     * If the Asset ID is found, it returns the resolved AAS ID.
     * If not found, it returns `null`.
     *
     * @param {string} searchAssetId - The Asset ID to resolve using the discovery service.
     * @returns {Promise<string | null>} A promise that resolves to the AAS ID as a string, or `null` if the Asset ID is not found.
     */
    async performAasDiscoverySearch(searchAssetId: string): Promise<string[] | null> {
        try {
            return (await this.discoveryServiceClient.getAasIdsByAssetId(searchAssetId)).result;
        } catch (e) {
            this.log.warn('Could not be found in the discovery service, will continue to look in the AAS registry');
        }
        return null;
    }

    /**
     * Searches for the Asset Administration Shell (AAS) from the registry.
     *
     * This function takes an AAS ID and attempts to find the corresponding AAS in the registry.
     * If no endpoint is found, it returns `null`.
     *
     * @param {string} searchAasId - The AAS ID to search for in the registry.
     * @returns {Promise<RegistrySearchResult | null>} A promise that resolves to a RegistrySearchResult containing:
     *   - `endpoints`: The retrieved Asset Administration Shell endpoints.
     *   - `submodelDescriptors`: Additional data related to the AAS submodels.
     *   or `null` if the AAS is not found in the registry.
     */
    async performAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult | null> {
        try {
            const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
            const endpoints = shellDescription.endpoints as Endpoint[];
            const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];

            if (!endpoints) {
                return null;
            }

            const endpointUrls = endpoints.map((endpoint) => new URL(endpoint.protocolInformation.href));
            return {
                endpoints: endpointUrls,
                submodelDescriptors: submodelDescriptors,
            };
        } catch (e) {
            this.log.warn('Could not be found in the registry service, will continue to look in the AAS repository');
            return null;
        }
    }

    /**
     * Retrieves the Asset Administration Shell (AAS) from the registry.
     *
     * This function takes an endpoint and attempts to fetch the AAS from it.
     * If not found, it returns `null`.
     *
     * @param {URL} endpoint - The endpoint from a previous registry search.
     * @returns {Promise<AssetAdministrationShell | null>} A promise that resolves to an AAS
     *   or `null` if the AAS is not found in the registry.
     */
    async fetchRegistrySearchResult(endpoint: URL): Promise<AssetAdministrationShell | null> {
        try {
            const aas = await this.fetch(endpoint, {
                method: 'GET',
            });

            return aas.json();
        } catch (e) {
            this.log.warn(`Could not find an AAS at the given endpoint at '${endpoint}'`);
            return null;
        }
    }

    async fetchFirstAasFromRegistrySearch(searchAasId: string): Promise<AasSearchResult | null> {
        const registrySearchResult = await this.performAasRegistrySearch(searchAasId);
        if (!registrySearchResult) {
            return null;
        }
        const endpoint = registrySearchResult.endpoints[0];
        const aas = await this.fetchRegistrySearchResult(endpoint);
        if (!aas) {
            return null;
        }
        const data = {
            submodelDescriptors: registrySearchResult.submodelDescriptors,
            aasRegistryRepositoryOrigin: endpoint.origin,
        };
        return this.createAasResult(aas, data);
    }
}

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};
