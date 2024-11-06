import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { PrismaConnector } from 'lib/services/database/PrismaConnector';
import { IPrismaConnector } from 'lib/services/database/PrismaConnectorInterface';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';

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

    static create(baseRepositoryUrl?: string | null): RepositorySearchService {
        const repositoryClient = AssetAdministrationShellRepositoryApi.create(
            mnestixFetch(),
            undefined,
            baseRepositoryUrl ?? process.env.AAS_REPO_API_URL,
        );
        const submodelRepositoryClient = SubmodelRepositoryApi.create(
            mnestixFetch(),
            undefined,
            baseRepositoryUrl ?? process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL,
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
        const response = await this.repositoryClient.getAssetAdministrationShellById(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'AAS not found');
    }

    async getAasFromRepo(aasId: string, repoUrl: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const response = await this.repositoryClient.getAssetAdministrationShellById(aasId, undefined, repoUrl);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, `AAS '${aasId}' not found in repository '${repoUrl}'`);
    }

    async getAasFromAllRepos(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult[]>> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map(
            (url) =>
                this.getAasFromRepo(aasId, url).then((response: ApiResponseWrapper<AssetAdministrationShell>) => {
                    return { wrapper: response, location: url };
                }), // add the URL to the resolved value
        );

        const responses = await Promise.allSettled(promises);
        const fulfilledResponses = responses.filter(
            (result) => result.status === 'fulfilled' && result.value.wrapper.isSuccess,
        );

        if (fulfilledResponses.length > 0) {
            return wrapSuccess<RepoSearchResult[]>(
                fulfilledResponses.map(
                    (
                        result: PromiseFulfilledResult<{
                            wrapper: ApiResponseWrapper<AssetAdministrationShell>;
                            location: string;
                        }>,
                    ) => ({ aas: result.value.wrapper.result!, location: result.value.location }),
                ),
            );
        } else {
            return wrapErrorCode(ApiResultStatus.NOT_FOUND, `Could not find AAS ${aasId} in any Repository`);
        }
    }

    async getSubmodelById(id: string): Promise<ApiResponseWrapper<Submodel>> {
        const result = await this.submodelRepositoryClient.getSubmodelById(id);
        if (result.isSuccess) return result;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, `Submodel with id ${id} not found`);
    }

    async getAttachmentFromSubmodelElement(
        submodelId: string,
        submodelElementPath: string,
    ): Promise<ApiResponseWrapper<Blob>> {
        const response = await this.submodelRepositoryClient.getAttachmentFromSubmodelElement(
            submodelId,
            submodelElementPath,
        );
        if (response.isSuccess) return response;
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `Attachment for Submodel with id ${submodelId} at path ${submodelElementPath} not found`,
        );
    }

    async getSubmodelFromAllRepos(submodelId: string): Promise<ApiResponseWrapper<Submodel>> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '2',
            typeName: 'SUBMODEL_REPOSITORY',
        });
        const promises = basePathUrls.map(async (url) => {
            const response = await this.submodelRepositoryClient.getSubmodelById(submodelId, undefined, url);
            if (response.isSuccess) return response;
            return Promise.reject();
        });

        try {
            return await Promise.any(promises);
        } catch (e) {
            return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'Submodel not found');
        }
    }

    async getSubmodelReferencesFromShell(aasId: string): Promise<ApiResponseWrapper<Reference[]>> {
        const response = await this.repositoryClient.getSubmodelReferencesFromShell(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'Submodel Reference not found');
    }

    async getThumbnailFromShell(aasId: string): Promise<ApiResponseWrapper<Blob>> {
        const response = await this.repositoryClient.getThumbnailFromShell(aasId);
        if (response.isSuccess) return response;

        return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'Thumbnail not found');
    }

    async getAasThumbnailFromAllRepos(aasId: string): Promise<ApiResponseWrapper<Blob>> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map((url) => {
            return this.repositoryClient.getThumbnailFromShell(aasId, undefined, url).then((response) => {
                if (response.isSuccess && response.result instanceof Blob && response.result.size === 0) {
                    return Promise.reject('Empty image');
                }
                return response;
            });
        });

        try {
            return await Promise.any(promises);
        } catch {
            return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'Image not found');
        }
    }
}
