'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { Endpoint, RegistryAasData, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { AssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/api';
import { encodeBase64 } from 'lib/util/Base64Util';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AasSearchResult } from 'lib/searchUtilActions/searchClient';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';

export interface RegistrySearchResult {
    registryAas: AssetAdministrationShell;
    registryAasData?: RegistryAasData;
}

export async function performFullAasSearch(searchInput: string): Promise<AasSearchResult> {
    const searcher = await getAasSearcher();
    return searcher.fullSearch(searchInput);
}

export async function performRegistryAasSearch(searchInput: string): Promise<RegistrySearchResult | null> {
    const searcher = await getAasSearcher();
    return searcher.handleAasRegistrySearch(searchInput);
}

export async function performDiscoveryAasSearch(searchInput: string): Promise<string[] | null> {
    const searcher = await getAasSearcher();
    return searcher.handleAasDiscoverySearch(searchInput);
}

export async function getAasSearcher(): Promise<AasSearcher> {
    const repositoryClient = new AssetAdministrationShellRepositoryApi({
        basePath: process.env.AAS_REPO_API_URL,
        fetch: mnestixFetch(),
    });
    const registryServiceClient = new RegistryServiceApi(process.env.REGISTRY_API_URL);
    const discoveryServiceClient = new DiscoveryServiceApi(process.env.DISCOVERY_API_URL);
    return new AasSearcher(discoveryServiceClient, registryServiceClient, repositoryClient, fetch);
}

export class AasSearcher {
    constructor(
        protected readonly discoveryServiceClient: IDiscoveryServiceApi,
        protected readonly registryService: IRegistryServiceApi,
        protected readonly repositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
    ) {}

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
            console.warn('Could not be found in the discovery service, will continue to look in the AAS repository.');
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
            const aasRepositoryOrigin = getAasRepositoryOrigin(aasEndpoint);

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
            console.warn('Could not be found in the registry service, will continue to look in the AAS registry.');
            return null;
        }
    }
}

export async function getSubmodelFromSubmodelDescriptor(url: string) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}

function getAasRepositoryOrigin(url: string) {
    const urlObject = new URL(url);
    return urlObject.origin;
}
