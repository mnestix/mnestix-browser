'use server';

import { AasSearcher, AasSearchResult, AasResult } from 'lib/services/searchUtilActions/AasSearcher';

export async function performFullAasSearch(searchInput: string): Promise<AasSearchResult> {
    const searcher = AasSearcher.create();
    return searcher.fullSearch(searchInput);
}

export async function performRegistryAasSearch(searchInput: string): Promise<AasResult | null> {
    const searcher = AasSearcher.create();
    
    // If AAS is not found in the repository -> return null
    const registrySearchResult = await searcher.performAasRegistrySearch(searchInput);
    if (!registrySearchResult) {
        return null;
    }

    // If the endpoint in the registry fails to fetch the AAS -> return null
    const endpoint = registrySearchResult.endpoints[0];
    const aasResult = await searcher.fetchRegistrySearchResult(endpoint);
    if (!aasResult) {
        return null;
    }

    // Wrap the result in a combined object
    return {
        registryAas: aasResult,
        registryAasData: {
            submodelDescriptors: registrySearchResult.submodelDescriptors,
            aasRegistryRepositoryOrigin: endpoint.origin,
        },
    };
}

export async function performDiscoveryAasSearch(searchInput: string): Promise<string[] | null> {
    const searcher = AasSearcher.create();
    return searcher.performAasDiscoverySearch(searchInput);
}

export async function getSubmodelFromSubmodelDescriptor(url: string) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}
