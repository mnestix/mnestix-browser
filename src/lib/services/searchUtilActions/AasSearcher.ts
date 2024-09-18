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
} from 'lib/services/multipleDataSourceActions/MultipleRepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';

export interface RegistrySearchResult {
    registryAas: AssetAdministrationShell;
    registryAasData?: RegistryAasData;
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
export type AasSearchResult = {
    redirectUrl: string;
    aas: AssetAdministrationShell | null;
    aasData: AasData | null;
};

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
                shellsByRegistryEndpoint,
                shellsSavedInTheRepositories: shellsSavedInTheRepositories,
                submodelsSavedInTheRepository,
            }),
            stubbedFetch,
            log ?? Log.createNull(),
        );
    }

    async fullSearch(val: string): Promise<AasSearchResult> {
        const aasIds = await this.performAasDiscoverySearch(val);
        if (aasIds && aasIds.length > 1) {
            return {
                redirectUrl: `/viewer/discovery?assetId=${val}`,
                aas: null,
                aasData: null,
            };
        } else {
            // Check if an AAS ID is found in the Discovery service, or assign the input parameter for further search.
            // If there is exactly one AAS ID in the aasIds array, use it; otherwise, use the input parameter 'val'.
            const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : val;
            const registrySearchResult = await this.performAasRegistrySearch(aasId);

            let aas: AssetAdministrationShell;
            if (registrySearchResult != null) {
                aas = registrySearchResult.registryAas;
            } else {
                const aasIdEncoded = encodeBase64(aasId);
                try {
                    aas = await this.multipleDataSource.getAasFromDefaultRepository(aasIdEncoded);
                } catch (e) {
                    const potentiallyMultipleAas = await this.multipleDataSource.getAasFromAllRepos(aasIdEncoded);
                    if (potentiallyMultipleAas.length > 1)
                        return {
                            redirectUrl: `/viewer/discovery?assetId=${val}`,
                            aas: null,
                            aasData: null,
                        };
                    aas = potentiallyMultipleAas[0].aas;
                }
            }

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
     * Searches for and retrieves the Asset Administration Shell (AAS) from the registry.
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
    async performAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult | null> {
        try {
            const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
            const endpoints = shellDescription.endpoints as Endpoint[];
            const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];

            if (!endpoints) {
                throw new NotFoundError();
            }

            const aasEndpoint = endpoints[0].protocolInformation.href;
            const urlObject = new URL(aasEndpoint);
            const aasRepositoryOrigin = urlObject.origin;

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
