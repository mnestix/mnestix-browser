'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';

interface AasSearchResult {
    aasFromRegistry: AssetAdministrationShell | null;
    aasId: string;
    submodelDescriptors?: SubmodelDescriptor[];
}

/**
 * Retrieves the Asset Administration Shell (AAS) and its submodel descriptors from external services.
 *
 * @param {string} inputAas - The input AAS ID.
 * @returns {Promise<AasSearchResult>} A promise that resolves to an object containing:
 *   - `aasFromRegistry`: The retrieved Asset Administration Shell object, or `null` if not found in AAS Registry.
 *   - `aasId`: The resolved AAS ID from Discovery Service or inputAAS if not found.
 *   - `submodelDescriptors` (optional): An array of submodel descriptors associated with the AAS.
 */
export async function getAasFromExternalServices(inputAas: string): Promise<AasSearchResult> {
    const aasId = (await handleAasDiscoverySearch(inputAas)) ?? inputAas;

    const [aasFromRegistry, submodelDescriptors] = await handleAasRegistrySearch(aasId);

    return {
        aasFromRegistry: aasFromRegistry,
        aasId: aasId,
        submodelDescriptors: submodelDescriptors,
    };
}

export async function handleAasRegistrySearch(
    searchAasId: string,
): Promise<[AssetAdministrationShell | null, SubmodelDescriptor[]?]> {
    const registryServiceClient = new RegistryServiceApi(process.env.REGISTRY_API_URL);

    try {
        const shellDescription = await registryServiceClient.getAssetAdministrationShellDescriptorById(searchAasId);
        const endpoints = shellDescription.endpoints as Endpoint[];
        const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];

        if (!endpoints) {
            throw new NotFoundError();
        }

        const aasEndpoint = endpoints.map((endpoint) => endpoint.protocolInformation.href)[0];

        const aas = await fetch(aasEndpoint, {
            method: 'GET',
        });

        return [await aas.json(), submodelDescriptors];
    } catch (e) {
        console.warn('Could not be found in the registry service, will continue to look in the AAS repository.');
        return [null];
    }
}

export async function handleAasDiscoverySearch(searchAasId: string): Promise<string | null> {
    try {
        const discoveryServiceClient = new DiscoveryServiceApi(process.env.DISCOVERY_API_URL);

        if (!searchAasId) {
            throw new NotFoundError();
        }
        const aasIds = (await discoveryServiceClient.getAasIdsByAssetId(searchAasId)).result;

        if (aasIds.length === 0) {
            throw new NotFoundError();
        }

        return aasIds[0];
    } catch (e) {
        console.warn('Could not be found in the discovery service, will continue to look in the AAS repository.');
        return null;
    }
}

export async function getSubmodelFromSubmodelDescriptor(url: string) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}
