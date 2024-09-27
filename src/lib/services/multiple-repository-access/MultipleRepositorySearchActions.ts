'use server';

import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import {
    MultipleRepositorySearchService,
    RepoSearchResult,
} from 'lib/services/multiple-repository-access/MultipleRepositorySearchService';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';

const searcher = MultipleRepositorySearchService.create();

export async function performSearchAasFromAllRepositories(searchInput: string): Promise<RepoSearchResult[]> {
    return searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<Submodel> {
    return searcher.getSubmodelFromAllRepos(searchInput);
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<Blob> {
    return searcher.getAasThumbnailFromAllRepos(searchInput);
}

export async function getAssetAdministrationShellById(searchInput: string): Promise<AssetAdministrationShell> {
    return searcher.getAasFromDefaultRepository(searchInput);
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
