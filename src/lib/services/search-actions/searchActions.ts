'use server';

import { NotFoundError } from 'lib/errors/NotFoundError';
import { AasSearcher, AasSearchResult } from 'lib/services/search-actions/AasSearcher';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export async function performFullAasSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
    const searcher = AasSearcher.create();
    return (await searcher.performFullSearch(searchInput)).toJSON();
}

export async function getAasFromRepository(
    aasId: string,
    repositoryUrl: string,
): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
    const searcher = AasSearcher.create();
    return (await searcher.getAasFromRepository(aasId, repositoryUrl)).toJSON();
}

export async function performRegistryAasSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
    const searcher = AasSearcher.create();
    return (await searcher.performRegistrySearch(searchInput)).toJSON();
}

export async function performDiscoveryAasSearch(searchInput: string): Promise<ApiResponseWrapper<string[]>> {
    const searcher = AasSearcher.create();
    return (await searcher.performAasDiscoverySearch(searchInput)).toJSON();
}

export async function getSubmodelFromSubmodelDescriptor(url: string) : Promise<ApiResponseWrapper<Submodel>> {
    const response = await fetch(url, {
        method: 'GET',
    });
    const wrapper = await ApiResponseWrapper.fromResponse(response)
    return wrapper.transformResult<Submodel>(JSON.parse).toJSON();
}
