import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { PrismaConnector } from 'lib/services/prisma/PrismaConnector';
import { IPrismaConnector } from 'lib/services/prisma/PrismaConnectorInterface';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { NotFoundError } from 'lib/errors/NotFoundError';
import { ApiResponseWrapper, ApiResultMapper } from 'lib/services/apiResponseWrapper';

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};

export interface NullableMultipleDataSourceSetupParameters {
    shellsSavedInTheRepositories?: INullableAasRepositoryEntries[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    log?: Log | null;
}

export class RepositorySearchService {
    private constructor(
        protected readonly repositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly submodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly prismaConnector: IPrismaConnector,
        protected readonly log: Log,
    ) {}

    static create(): RepositorySearchService {
        const repositoryClient = AssetAdministrationShellRepositoryApi.create(
            mnestixFetch(),
            undefined,
            process.env.AAS_REPO_API_URL,
        );
        const submodelRepositoryClient = SubmodelRepositoryApi.create(
            mnestixFetch(),
            undefined,
            process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL,
        );
        const log = Log.create();
        const prismaConnector = PrismaConnector.create();
        return new RepositorySearchService(repositoryClient, submodelRepositoryClient, prismaConnector, log);
    }

    static createNull({
        shellsSavedInTheRepositories = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableMultipleDataSourceSetupParameters = {}): RepositorySearchService {
        const aasUrls = [...new Set(shellsSavedInTheRepositories?.map((entry) => entry.repositoryUrl))];
        return new RepositorySearchService(
            AssetAdministrationShellRepositoryApi.createNull({ shellsSavedInTheRepositories }),
            SubmodelRepositoryApi.createNull({ submodelsSavedInTheRepository }),
            PrismaConnector.createNull({ aasUrls }),
            log ?? Log.createNull(),
        );
    }

    async getAasFromDefaultRepository(aasId: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const result = await this.repositoryClient.getAssetAdministrationShellById(aasId);
        if (result.isSuccess()) return result;
        return ApiResponseWrapper.fromErrorCode(ApiResultMapper.NOT_FOUND, 'AAS not found');
    }

    async getAasFromRepo(aasId: string, repoUrl: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const result = await this.repositoryClient.getAssetAdministrationShellById(aasId, undefined, repoUrl);
        if (result.isSuccess()) return result;
        return ApiResponseWrapper.fromErrorCode(
            ApiResultMapper.NOT_FOUND,
            `AAS '${aasId}' not found in repository '${repoUrl}'`,
        );
    }

    async getAasFromAllRepos(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult[]>> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map(
            (url) => this.getAasFromRepo(aasId, url).then((response: ApiResponseWrapper<AssetAdministrationShell>) =>
            {
                return { wrapper: response, location: url }
            }
            ), // add the URL to the resolved value
        );

        const results = await Promise.allSettled(promises);
        const fulfilledResults = results.filter((result) => result.status === 'fulfilled' && result.value.wrapper.isSuccess());

        if (fulfilledResults.length > 0) {
            return ApiResponseWrapper.fromSuccess<RepoSearchResult[]>(
                fulfilledResults.map(
                    (result: PromiseFulfilledResult<{wrapper: ApiResponseWrapper<AssetAdministrationShell>, location: string}>) =>
                        ({ aas: result.value.wrapper.result!, location: result.value.location })
                )
            );
        } else {
            return ApiResponseWrapper.fromErrorCode(ApiResultMapper.NOT_FOUND, `Could not find AAS ${aasId} in any Repository`);
        }
    }

    async getSubmodelById(id: string): Promise<Submodel> {
        const result = await this.submodelRepositoryClient.getSubmodelById(id);
        if (result.isSuccess()) return result.result!;
        throw new NotFoundError(`Submodel with id ${id} not found`);
    }

    async getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string): Promise<Blob> {
        const response = await this.submodelRepositoryClient.getAttachmentFromSubmodelElement(
            submodelId,
            submodelElementPath,
        );
        if (response.isSuccess()) return response.result!;
        throw new NotFoundError(
            `Attachment for Submodel with id ${submodelId} at path ${submodelElementPath} not found`,
        );
    }

    async getSubmodelFromAllRepos(submodelId: string) {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '2',
            typeName: 'SUBMODEL_REPOSITORY',
        });
        const promises = basePathUrls.map((url) =>
            this.submodelRepositoryClient.getSubmodelById(submodelId, undefined, url),
        );

        try {
            return await Promise.any(promises);
        } catch (error) {
            throw new NotFoundError('Submodel not found');
        }
    }

    async getSubmodelReferencesFromShell(aasId: string): Promise<Reference[]> {
        const response = await this.repositoryClient.getSubmodelReferencesFromShell(aasId);
        if (response.isSuccess()) return response.result!;
        throw new NotFoundError('Submodel Reference not found');
    }

    async getThumbnailFromShell(aasId: string): Promise<Blob> {
        const response = await this.repositoryClient.getThumbnailFromShell(aasId);
        if (response.isSuccess()) return response.result!;
        throw new NotFoundError('Thumbnail not found');
    }

    async getAasThumbnailFromAllRepos(aasId: string) {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map((url) =>
            {
                this.repositoryClient.getThumbnailFromShell(aasId, undefined, url).then((response) => {
                    if (response.isSuccess() && response.result!.size === 0) {
                        throw new Error('Empty image');
                    }
                    return response.result!;
                })
            },
        );

        try {
            return await Promise.any(promises);
        } catch {
            throw new NotFoundError('Image not found');
        }
    }
}
