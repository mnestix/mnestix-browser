'use server';

import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { AasRepoSearchResult, RepositorySearchService } from 'lib/services/repository-access/RepositorySearchService';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

const searcher = RepositorySearchService.create();

export async function performSearchAasFromAllRepositories(
    searchInput: string,
): Promise<ApiResponseWrapper<AasRepoSearchResult[]>> {
    return await searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Submodel>> {
    return await searcher.getSubmodelFromAllRepos(searchInput);
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Blob>> {
    return await searcher.getAasThumbnailFromAllRepos(searchInput);
}

export async function getThumbnailFromShell(searchInput: string): Promise<ApiResponseWrapper<Blob>> {
    return await searcher.getThumbnailFromShell(searchInput);
}

export async function getSubmodelReferencesFromShell(searchInput: string): Promise<ApiResponseWrapper<Reference[]>> {
    return await searcher.getSubmodelReferencesFromShell(searchInput);
}

export async function getSubmodelById(id: string): Promise<ApiResponseWrapper<Submodel>> {
    return await searcher.getSubmodelById(id);
}

export async function getAttachmentFromSubmodelElement(
    submodelId: string,
    submodelElementPath: string,
): Promise<ApiResponseWrapper<Blob>> {
    return await searcher.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
}
