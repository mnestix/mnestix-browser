'use server';

import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { RepoSearchResult, RepositorySearchService } from 'lib/services/repository-access/RepositorySearchService';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper, wrapErrorCode, wrapSuccess } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';

const searcher = RepositorySearchService.create();

export async function performSearchAasFromAllRepositories(
    searchInput: string,
): Promise<ApiResponseWrapper<RepoSearchResult<AssetAdministrationShell>[]>> {
    return searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Submodel>> {
    const response = await searcher.getFirstSubmodelFromAllRepos(searchInput);
    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Blob>> {
    const response = await searcher.getFirstAasThumbnailFromAllRepos(searchInput);
    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}

export async function getThumbnailFromShell(
    aasId: string,
    baseRepositoryUrl?: string,
): Promise<ApiResponseWrapper<Blob>> {
    if (baseRepositoryUrl) {
        const fileSearcher = AssetAdministrationShellRepositoryApi.create(baseRepositoryUrl, mnestixFetch());
        return await fileSearcher.getThumbnailFromShell(aasId);
    }

    const response = await searcher.getFirstAasThumbnailFromAllRepos(aasId);

    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}

export async function getSubmodelReferencesFromShell(searchInput: string): Promise<ApiResponseWrapper<Reference[]>> {
    const response = await searcher.getFirstSubmodelReferencesFromShellFromAllRepos(searchInput);
    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}

export async function getSubmodelById(id: string): Promise<ApiResponseWrapper<Submodel>> {
    const response = await searcher.getFirstSubmodelFromAllRepos(id);
    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}

export async function getAttachmentFromSubmodelElement(
    submodelId: string,
    submodelElementPath: string,
    baseRepositoryUrl?: string,
): Promise<ApiResponseWrapper<Blob>> {
    if (baseRepositoryUrl) {
        const fileSearcher = SubmodelRepositoryApi.create(baseRepositoryUrl, mnestixFetch());
        return await fileSearcher.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
    }

    const response = await searcher.getFirstAttachmentFromSubmodelElementFromAllRepos(submodelId, submodelElementPath);
    if (!response.isSuccess) return wrapErrorCode(response.errorCode, response.message);
    return wrapSuccess(response.result.searchResult);
}
