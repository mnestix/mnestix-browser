'use server';

import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { RepoSearchResult, RepositorySearchService } from 'lib/services/repository-access/RepositorySearchService';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

const searcher = RepositorySearchService.create();

export async function performSearchAasFromAllRepositories(
    searchInput: string,
): Promise<ApiResponseWrapper<RepoSearchResult[]>> {
    return await searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Submodel>> {
    return await searcher.getSubmodelFromAllRepos(searchInput);
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Blob>> {
    return await searcher.getAasThumbnailFromAllRepos(searchInput);
}

export async function getAssetAdministrationShellById(
    searchInput: string,
): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
    return await searcher.getAasFromDefaultRepository(searchInput);
}

export async function getThumbnailFromShell(
    searchInput: string,
    baseRepositoryUrl?: string | null,
): Promise<ApiResponseWrapper<Blob>> {
    const fileSearcher = RepositorySearchService.create(baseRepositoryUrl);
    return await fileSearcher.getThumbnailFromShell(searchInput);
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
    baseRepositoryUrl?: string | null,
): Promise<ApiResponseWrapper<Blob>> {
    const fileSearcher = RepositorySearchService.create(baseRepositoryUrl);
    return await fileSearcher.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
}
