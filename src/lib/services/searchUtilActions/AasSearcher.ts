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
    shellsByRegistryEndpoint?: { path: string; aas: AssetAdministrationShell }[] | null;
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
        const stubbedFetch = async (input: RequestInfo | URL): Promise<Response> => {
            if (!shellsByRegistryEndpoint) return Promise.reject(new Error('no registry configuration'));
            for (const aasEntry of shellsByRegistryEndpoint) {
                if (aasEntry.path === input) return new Response(JSON.stringify(aasEntry.aas));
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
        // (1) Look in discovery service -> return if multiple results
        const aasIds = await this.performAasDiscoverySearch(searchInput);
        if (aasIds && aasIds.length > 1) {
            return {
                redirectUrl: `/viewer/discovery?assetId=${searchInput}`,
                aas: null,
                aasData: null,
            };
        }

        // If there is exactly one AAS ID in the aasIds array, use it; otherwise, use the input parameter 'val'.
        const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : searchInput;

        // (2) Look in registry -> return first result, if any
        // TODO: handle multiple endpoints as result
        const registrySearchResult = await this.performAasRegistrySearch(aasId);
        if (registrySearchResult) {
            const endpoint = registrySearchResult.endpoints[0];
            const aas = await this.fetchRegistrySearchResult(endpoint);
            if (aas) {
                return {
                    redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
                    aas: aas,
                    aasData: {
                        submodelDescriptors: registrySearchResult.submodelDescriptors,
                        aasRegistryRepositoryOrigin: endpoint.origin,
                    },
                };
            }
        }

        // (3) Load AAS from default repository -> return if found in repository
        const aasIdEncoded = encodeBase64(aasId);
        const defaultResult = await this.multipleDataSource.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult) {
            return {
                redirectUrl: `/viewer/${encodeBase64(defaultResult.id)}`,
                aas: defaultResult,
                aasData: null,
            };
        }

        // (4) Load AAS from all other repositories -> return discovery page if found multiple aas
        const potentiallyMultipleAas = await this.multipleDataSource.getAasFromAllRepos(aasIdEncoded);
        if (potentiallyMultipleAas.length > 1)
            return {
                redirectUrl: `/viewer/discovery?assetId=${searchInput}`,
                aas: null,
                aasData: null,
            };

        // (5) Found exactly one aas in all repositories -> Return it
        const aas = potentiallyMultipleAas[0].aas;
        return {
            redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
            aas: aas,
            aasData: null,
        };

        // If not found: "Error: AAS could not be found"
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
            this.log.warn('Could not be found in the registry service, will continue to look in the AAS repository');
            return null;
        }
    }
}

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};
