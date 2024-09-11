import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { MultipleDataSource, RepoSearchResult } from 'lib/services/multipleDataSourceActions/MultipleDataSource';

export async function performSearchAasFromAllRepositories(searchInput: string): Promise<RepoSearchResult[]> {
    const searcher = MultipleDataSource.create();
    return searcher.getAasFromAllRepos(searchInput);
}

export async function performSearchSubmodelFromAllRepos(searchInput: string): Promise<Submodel> {
    const searcher = MultipleDataSource.create();
    return searcher.getSubmodelFromAllRepos(searchInput);
}

export async function performgetAasThumbnailFromAllRepos(searchInput: string): Promise<Blob> {
    const searcher = MultipleDataSource.create();
    return searcher.getAasThumbnailFromAllRepos(searchInput);
}
