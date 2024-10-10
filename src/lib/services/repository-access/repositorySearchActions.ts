'use server';

import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { RepoSearchResult, RepositorySearchService } from 'lib/services/repository-access/RepositorySearchService';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

const searcher = RepositorySearchService.create();

export async function performSearchAasFromAllRepositories(searchInput: string): Promise<ApiResponseWrapper<RepoSearchResult[]>> {
    return (await searcher.getAasFromAllRepos(searchInput)).toJSON();
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<ApiResponseWrapper<Submodel>> {
    return (await searcher.getSubmodelFromAllRepos(searchInput)).toJSON();
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<void> {
    return searcher.getAasThumbnailFromAllRepos(searchInput);
}

export async function getAssetAdministrationShellById(searchInput: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
    return (await searcher.getAasFromDefaultRepository(searchInput)).toJSON();
}

export async function getThumbnailFromShell(searchInput: string): Promise<Blob> {
    return searcher.getThumbnailFromShell(searchInput);
}

export async function getSubmodelReferencesFromShell(searchInput: string): Promise<Reference[]> {
    return searcher.getSubmodelReferencesFromShell(searchInput);
}

export async function getSubmodelById(id: string): Promise<Submodel> {
    return searcher.getSubmodelById(id);
}

export async function getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string): Promise<Blob> {
    return searcher.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
}
