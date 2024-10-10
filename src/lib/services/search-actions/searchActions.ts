'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { AasSearcher, AasSearchResult } from 'lib/services/search-actions/AasSearcher';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

export async function performFullAasSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
    const searcher = AasSearcher.create();
    return (await searcher.performFullSearch(searchInput)).toJSON();
}

export async function getAasFromRepository(
    aasId: string,
    repositoryUrl: string,
): Promise<AssetAdministrationShell | null> {
    const searcher = AasSearcher.create();
    return searcher.getAasFromRepository(aasId, repositoryUrl);
}

export async function performRegistryAasSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
    const searcher = AasSearcher.create();
    const result = searcher.performRegistrySearch(searchInput);
    if (!result) throw new NotFoundError(searchInput);
    return (await result).toJSON();
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
