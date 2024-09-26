'use server';

import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import {
    MultipleRepositorySearchService,
    RepoSearchResult,
} from 'lib/services/multiple-repository-access/MultipleRepositorySearchService';

export async function performSearchAasFromAllRepositories(searchInput: string): Promise<RepoSearchResult[]> {
    const searcher = MultipleRepositorySearchService.create();
    return searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<Submodel> {
    const searcher = MultipleRepositorySearchService.create();
    return searcher.getSubmodelFromAllRepos(searchInput);
}

export async function performGetAasThumbnailFromAllRepos(searchInput: string): Promise<Blob> {
    const searcher = MultipleRepositorySearchService.create();
    return searcher.getAasThumbnailFromAllRepos(searchInput);
}