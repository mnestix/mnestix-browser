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
import { NotFoundError } from 'lib/errors/NotFoundError';
import {
    MultipleRepositorySearchService,
    NullableMultipleDataSourceSetupParameters,
} from 'lib/services/MultipleRepositorySearch/MultipleRepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';
import { navigateReducer } from 'next/dist/client/components/router-reducer/reducers/navigate-reducer';
import { diffStringsRaw } from 'jest-diff';
import { setSelectionRange } from '@testing-library/user-event/event/selection/setSelectionRange';
import { descriptions } from 'jest-config';

export interface RegistrySearchResult {
    endpoint: URL;
    submodelDescriptor: SubmodelDescriptor;
}

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

// Discovery search returns multiple aas Ids
interface DiscoverySearchResult {
    aasIds: string[]; // has min 2 items
}

interface SingleAasSearchResult {
    aas: AssetAdministrationShell;
    aasData:{     submodelDescriptors: any     aasRegistryRepositoryOrigin: any } | null
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
    
    async fullSearchRedirectUrl(searchInput): string {
        // Pseudo code
        var x = this.fullSearch(searchInputId);

        if (typeof (x) === DiscoverySearchResult dsr) {
            URL = `/viewer/discovery?assetId=${searchInput}`;
            navigateToUrl(URL)
        } else if (typeof (x) === SingleAasSearchResult ssr) {
            URL = `/viewer?aasId=${searchInput}&endpoint=${setSelectionRange.endpoint}`;
            ssr.aas...
            ssr.aasData.toString..
        }
        // END
    }

    async fullSearch(searchInput: string): Promise<DiscoverySearchResult | MultipleAasSearchResult | SingleAasSearchResult> {
        // const discoverySerachResult = await this.performDiscoverySearch()
        // if discoverySerach
        // (1)  if single result: continue with first aas id
        // (2)  if multiple results: return list view
        // const registrySerachResult = await this.performRegistrySerach()
        // if registrySerachReslult
        // return
        // const respositorySerachResult = await this.performRepositorySearch()
        // return

      

        const aasIds = await this.performAasDiscoverySearch(searchInput);
        if (aasIds && aasIds.length > 1) {
            return {
                aasIds: aasIds,
            } as DiscoverySearchResult;
        }

        // If there is exactly one AAS ID in the aasIds array, use it; otherwise, use the input parameter 'val'.
        const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : searchInput;
        const registrySearchResult = await this.performAasRegistrySearch(aasId);

        if (registrySearchResult && registrySearchResult.length > 1) {
            // return MultipleAasSearchResult
            const aas = registrySearchResult.registryAas;
            const aasData =
                registrySearchResult?.registryAasData != null
                    ? {
                          submodelDescriptors: registrySearchResult.registryAasData.submodelDescriptors,
                          aasRegistryRepositoryOrigin: registrySearchResult.registryAasData.aasRegistryRepositoryOrigin,
                      }
                    : null;
            return {
                redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
                aas: aas,
                aasData: aasData,
            };
        }

        if (registrySearchResult) {
            // return SingleAasSearchResult
            const aas = registrySearchResult.registryAas;
            const aasData =
                registrySearchResult?.registryAasData != null
                    ? {
                        submodelDescriptors: registrySearchResult.registryAasData.submodelDescriptors,
                        aasRegistryRepositoryOrigin: registrySearchResult.registryAasData.aasRegistryRepositoryOrigin,
                    }
                    : null;
            return {
                redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
                aas: aas,
                aasData: aasData,
            };
        }

        const aasIdEncoded = encodeBase64(aasId);
        let defaultResult = await this.multipleDataSource.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult) {
            // return SingleAasSearchResult
            aas = defaultResult;
            const aasData =
                registrySearchResult?.registryAasData != null
                    ? {
                        submodelDescriptors: registrySearchResult.registryAasData.submodelDescriptors,
                        aasRegistryRepositoryOrigin: registrySearchResult.registryAasData.aasRegistryRepositoryOrigin
                    }
                    : null;
            return {
                redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
                aas: aas,
                aasData: aasData
            };
        }


        const potentiallyMultipleAas = await this.multipleDataSource.getAasFromAllRepos(aasIdEncoded);
        if (potentiallyMultipleAas.length > 1)
            return {
                redirectUrl: `/viewer/discovery?assetId=${searchInput}`,
                aas: null,
                aasData: null
            };
        aas = potentiallyMultipleAas[0].aas;

        const aasData =
            registrySearchResult?.registryAasData != null
                ? {
                      submodelDescriptors: registrySearchResult.registryAasData.submodelDescriptors,
                      aasRegistryRepositoryOrigin: registrySearchResult.registryAasData.aasRegistryRepositoryOrigin,
                  }
                : null;

        // If not found: Error: AAS could not be found

        return {
            redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
            aas: aas,
            aasData: aasData,
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
            if (!searchAssetId) {
                throw new NotFoundError();
            }
            const aasIds = (await this.discoveryServiceClient.getAasIdsByAssetId(searchAssetId)).result;

            if (aasIds.length === 0) {
                throw new NotFoundError();
            }

            return aasIds;
        } catch (e) {
            this.log.warn('Could not be found in the discovery service, will continue to look in the AAS registry');
            return null;
        }
    }

    /**
     * Searches for the Asset Administration Shell (AAS) from the registry.
     *
     * This function takes an AAS ID and attempts to find the corresponding AAS in the registry.
     * If not found, it returns `null`.
     *
     * @param {string} searchAasId - The AAS ID to search for in the registry.
     * @returns {Promise<RegistrySearchResult[] | null>} A promise that resolves to an array of objects containing:
     *   - `endpoint`: The retrieved Asset Administration Shell endpoint.
     *   - `submodelDescriptor`: Additional data related to the AAS submodels.
     *   or `null` if the AAS is not found in the registry.
     */
    async performAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult[] | null> {
        const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
        const endpoints = shellDescription.endpoints as Endpoint[];
        const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];

        if (!endpoints) {
            return null;
        }

        return endpoints.map((endpoint, i) => {
            const descriptor = submodelDescriptors[i];

            const aasEndpoint = endpoint.protocolInformation.href;
            const urlObject = new URL(aasEndpoint);
            return {
                endpoint: urlObject,
                submodelDescriptor: descriptor,
            } as RegistrySearchResult;
        });
    }

    /**
     * Retrieves the Asset Administration Shell (AAS) from the registry.
     *
     * This function takes an AAS ID and attempts to find the corresponding AAS in the registry.
     * If the AAS is found, it returns an object containing the AAS and any related data.
     * If not found, it returns `null`.
     *
     * @param {string} searchAasId - The AAS ID to search for in the registry.
     * @returns {Promise<RegistrySearchResult | null>} A promise that resolves to an object containing:
     *   - `registryAas`: The retrieved Asset Administration Shell object.
     *   - `registryAasData` (optional): Additional data related to the retrieved AAS.
     *   or `null` if the AAS is not found in the registry.
     */
    async fetchRegistrySearchResults(searchResults: RegistrySearchResult): Promise<AssetAdministrationShell> {
        try {
            const aas = await this.fetch(aasEndpoint, {
                method: 'GET',
            });
    
            const aasJson = await aas.json();
    
            return {
                registryAas: aasJson,
                registryAasData: {
                    submodelDescriptors: submodelDescriptors,
                    aasRegistryRepositoryOrigin: aasRepositoryOrigin,
                },
            };
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
