'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { AasSearcher, AasSearchResult } from 'lib/services/searchUtilActions/AasSearcher';

export async function performFullAasSearch(searchInput: string): Promise<AasSearchResult> {
    const searcher = AasSearcher.create();
    return searcher.performFullSearch(searchInput);
}

export async function performRegistryAasSearch(searchInput: string): Promise<AasSearchResult | null> {
    const searcher = AasSearcher.create();
    const result = searcher.performRegistrySearch(searchInput);
    if (!result) throw new NotFoundError(searchInput);
    return result;
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
