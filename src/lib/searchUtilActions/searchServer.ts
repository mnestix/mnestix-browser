'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { Endpoint, RegistryAasData, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';

interface RegistrySearchResult {
    registryAas: AssetAdministrationShell;
    registryAasData?: RegistryAasData;
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
export async function handleAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult | null> {
    const registryServiceClient = new RegistryServiceApi(process.env.REGISTRY_API_URL);

    try {
        const shellDescription = await registryServiceClient.getAssetAdministrationShellDescriptorById(searchAasId);
        const endpoints = shellDescription.endpoints as Endpoint[];
        const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];

        if (!endpoints) {
            throw new NotFoundError();
        }

        const aasEndpoint = endpoints.map((endpoint) => endpoint.protocolInformation.href)[0];
        const aasRepositoryOrigin = getAasRepositoryOrigin(aasEndpoint);

        const aas = await fetch(aasEndpoint, {
            method: 'GET',
        });

        return {
            registryAas: await aas.json(),
            registryAasData: {
                submodelDescriptors: submodelDescriptors,
                aasRegistryRepositoryOrigin: aasRepositoryOrigin,
            },
        };
    } catch (e) {
        console.warn('Could not be found in the registry service, will continue to look in the AAS repository.');
        return null;
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
export async function handleAasDiscoverySearch(searchAssetId: string): Promise<string[] | null> {
    try {
        const discoveryServiceClient = new DiscoveryServiceApi(process.env.DISCOVERY_API_URL);

        if (!searchAssetId) {
            throw new NotFoundError();
        }
        const aasIds = (await discoveryServiceClient.getAasIdsByAssetId(searchAssetId)).result;

        if (aasIds.length === 0) {
            throw new NotFoundError();
        }

        return aasIds;
    } catch (e) {
        console.warn('Could not be found in the discovery service, will continue to look in the AAS registry.');
        return null;
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
