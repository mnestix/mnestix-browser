'use server';

import { AasSearcher, AasSearchResult, RegistrySearchResult } from 'lib/services/searchUtilActions/AasSearcher';

export async function performFullAasSearch(searchInput: string): Promise<AasSearchResult> {
    const searcher = AasSearcher.create();
    return searcher.fullSearch(searchInput);
}

export async function performRegistryAasSearch(searchInput: string): Promise<RegistrySearchResult | null> {
    const searcher = AasSearcher.create();
    return searcher.handleAasRegistrySearch(searchInput);
}

export async function performDiscoveryAasSearch(searchInput: string): Promise<string[] | null> {
    const searcher = AasSearcher.create();
    return searcher.handleAasDiscoverySearch(searchInput);
}

export async function getSubmodelFromSubmodelDescriptor(url: string) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}
