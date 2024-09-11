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
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { encodeBase64 } from 'lib/util/Base64Util';
import { NotFoundError } from 'lib/errors/NotFoundError';

export interface RegistrySearchResult {
    registryAas: AssetAdministrationShell;
    registryAasData?: RegistryAasData;
}

interface NullableSearchSetupParameters {
    discoveryEntries?: { assetId: string; aasIds: string[] }[];
    registryShellDescriptorEntries?: AssetAdministrationShellDescriptor[] | null;
    shellsByRegistryEndpoint?: { path: string; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepository?: AssetAdministrationShell[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    log?: Log | null;
}

export class AasSearcher {
    private constructor(
        protected readonly discoveryServiceClient: IDiscoveryServiceApi,
        protected readonly registryService: IRegistryServiceApi,
        protected readonly repositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly submodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
        protected readonly log: Log,
    ) {}

    static create(): AasSearcher {
        const repositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: process.env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        });
        const submodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: process.env.SUBMODEL_REPO_API_URL,
            fetch: mnestixFetch(),
        });
        const registryServiceClient = RegistryServiceApi.create(process.env.REGISTRY_API_URL);
        const discoveryServiceClient = DiscoveryServiceApi.create(process.env.DISCOVERY_API_URL);
        const log = Log.create();
        return new AasSearcher(
            discoveryServiceClient,
            registryServiceClient,
            repositoryClient,
            submodelRepositoryClient,
            fetch,
            log,
        );
    }

    static createNull({
        discoveryEntries = [],
        registryShellDescriptorEntries = [],
        shellsByRegistryEndpoint = [],
        shellsSavedInTheRepository = [],
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
            AssetAdministrationShellRepositoryApi.createNull({ shellsSavedInTheRepository }),
            SubmodelRepositoryApi.createNull({ submodelsSavedInTheRepository }),
            stubbedFetch,
            log ?? Log.createNull(),
        );
    }

    async fullSearch(val: string) {
        const aasIds = await this.handleAasDiscoverySearch(val);
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
            const registrySearchResult = await this.handleAasRegistrySearch(aasId);

            const aas =
                registrySearchResult != null
                    ? registrySearchResult.registryAas
                    : await this.repositoryClient.getAssetAdministrationShellById(encodeBase64(aasId));

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
     * Resolves the given AAS ID using the discovery service.
     *
     * This function takes an AAS ID and attempts to resolve it using a discovery service.
     * If the AAS ID is found, it returns the resolved AAS ID.
     * If not found, it returns `null`.
     *
     * @param {string} searchAssetId - The AAS ID to resolve using the discovery service.
     * @returns {Promise<string | null>} A promise that resolves to the resolved AAS ID as a string, or `null` if the AAS ID is not found.
     */
    async handleAasDiscoverySearch(searchAssetId: string): Promise<string[] | null> {
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
            this.log.warn('Could not be found in the discovery service, will continue to look in the AAS repository.');
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
    async handleAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult | null> {
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
            this.log.warn('Could not be found in the registry service, will continue to look in the AAS registry.');
            return null;
        }
    }
}

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};
