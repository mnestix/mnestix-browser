import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { PrismaConnector } from 'lib/services/database/PrismaConnector';
import { IPrismaConnector } from 'lib/services/database/PrismaConnectorInterface';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';

export type RepoSearchResult<T> = {
    searchResult: T;
    location: string;
};

export interface NullableMultipleDataSourceSetupParameters {
    shellsSavedInTheRepositories: AssetAdministrationShell[];
    submodelsSavedInTheRepository: Submodel[];
    log?: Log;
}

const noDefaultAasRepository = <T>() =>
    wrapErrorCode<T>(ApiResultStatus.INTERNAL_SERVER_ERROR, 'No default AAS repository configured');
const noDefaultSubmodelRepository = <T>() =>
    wrapErrorCode<T>(ApiResultStatus.INTERNAL_SERVER_ERROR, 'No default Submodel repository configured');

export class RepositorySearchService {
    private constructor(
        protected readonly prismaConnector: IPrismaConnector,
        protected readonly getAasRepositoryClient: (basePath: string) => IAssetAdministrationShellRepositoryApi,
        protected readonly getSubmodelRepositoryClient: (basePath: string) => ISubmodelRepositoryApi,
        protected readonly log: Log,
    ) {}

    static create(): RepositorySearchService {
        const log = Log.create();
        const prismaConnector = PrismaConnector.create();
        return new RepositorySearchService(
            prismaConnector,
            (baseUrl) => AssetAdministrationShellRepositoryApi.create(baseUrl, mnestixFetch()),
            (baseUrl) => SubmodelRepositoryApi.create(baseUrl, mnestixFetch()),
            log,
        );
    }

    static createNull(
        shellsInRepository: AssetAdministrationShell[] = [],
        submodelsInRepository: Submodel[] = [],
        log = null,
    ): RepositorySearchService {
        return new RepositorySearchService(
            PrismaConnector.createNull(['https://testAasRepository.com'], ['https://testSubmodelRepository.com']),
            (baseUrl) => AssetAdministrationShellRepositoryApi.createNull(baseUrl, shellsInRepository),
            (baseUrl) => SubmodelRepositoryApi.createNull(baseUrl, submodelsInRepository),
            log ?? Log.createNull(),
        );
    }

    async getAasRepositories() {
        return this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });
    }

    async getSubmodelRepositories() {
        return this.prismaConnector.getConnectionDataByTypeAction({
            id: '2',
            typeName: 'SUBMODEL_REPOSITORY'
        });
    }

    async getAasFromDefaultRepo(aasId: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const client = this.getDefaultAasRepositoryClient();
        if (!client) return noDefaultAasRepository();
        const response = await client.getAssetAdministrationShellById(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'AAS not found');
    }

    async getAasFromAllRepos(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult<AssetAdministrationShell>[]>> {
        return this.getFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getAasFromRepo(aasId, basePath),
            `Could not find AAS ${aasId} in any Repository`
        );
    }

    async getFirstAasFromAllRepos(
        aasId: string
    ): Promise<ApiResponseWrapper<RepoSearchResult<AssetAdministrationShell>>> {
        return this.getFirstFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getAasFromRepo(aasId, basePath),
            `Could not find AAS ${aasId} in any Repository`
        );
    }

    async getSubmodelFromAllRepos(submodelId: string): Promise<ApiResponseWrapper<RepoSearchResult<Submodel>[]>> {
        return this.getFromAllRepos(
            await this.getSubmodelRepositories(),
            (basePath) => this.getSubmodelFromRepo(submodelId, basePath),
            `Could not find Submodel '${submodelId}' in any Repository`
        );
    }

    async getSubmodelFromDefaultRepo(id: string): Promise<ApiResponseWrapper<Submodel>> {
        const client = this.getDefaultSubmodelRepositoryClient();
        if (!client) return noDefaultSubmodelRepository();
        const result = await client.getSubmodelById(id);
        if (result.isSuccess) return result;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, `Submodel with id '${id}' not found`);
    }

    private async getSubmodelFromRepo(submodelId: string, repoUrl: string): Promise<ApiResponseWrapper<Submodel>> {
        const client = this.getSubmodelRepositoryClient(repoUrl);
        const response = await client.getSubmodelById(submodelId);
        if (response.isSuccess) return response;
        return Promise.reject(`Unable to fetch Submodel '${submodelId}' from '${repoUrl}'`);
    }

    async getFirstSubmodelFromAllRepos(submodelId: string): Promise<ApiResponseWrapper<RepoSearchResult<Submodel>>> {
        return this.getFirstFromAllRepos(
            await this.getSubmodelRepositories(),
            (basePath) => this.getSubmodelFromRepo(submodelId, basePath),
            `Could not find Submodel '${submodelId}' in any Repository`,
        );
    }

    async getAttachmentFromSubmodelElementFromAllRepos(
        submodelId: string,
        submodelElementPath: string,
    ): Promise<ApiResponseWrapper<RepoSearchResult<Blob>[]>> {
        return this.getFromAllRepos(
            await this.getSubmodelRepositories(),
            (basePath) => this.getAttachmentFromSubmodelElementFromRepo(submodelId, submodelElementPath, basePath),
            `Attachment for Submodel with id ${submodelId} at path ${submodelElementPath} not found in any repository`
        );
    }

    async getAttachmentFromSubmodelElementFromDefaultRepo(
        submodelId: string,
        submodelElementPath: string,
    ): Promise<ApiResponseWrapper<Blob>> {
        const client = this.getDefaultSubmodelRepositoryClient();
        if (!client) return noDefaultSubmodelRepository();
        const response = await client.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
        if (response.isSuccess) return response;
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `Attachment for Submodel with id '${submodelId}' at path '${submodelElementPath}' not found in repository '${client.getBaseUrl()}'`,
        );
    }

    private async getAttachmentFromSubmodelElementFromRepo(
        submodelId: string,
        submodelElementPath: string,
        repoUrl: string,
    ) {
        const client = this.getSubmodelRepositoryClient(repoUrl);
        const response = await client.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
        if (response.isSuccess) return response;
        return Promise.reject(
            `Unable to fetch Attachment '${submodelElementPath}' in submodel '${submodelId}' from '${repoUrl}'`,
        );
    }

    async getFirstAttachmentFromSubmodelElementFromAllRepos(
        submodelId: string,
        submodelElementPath: string
    ): Promise<ApiResponseWrapper<RepoSearchResult<Blob>>> {
        return this.getFirstFromAllRepos(
            await this.getSubmodelRepositories(),
            (basePath) => this.getAttachmentFromSubmodelElementFromRepo(submodelId, submodelElementPath, basePath),
            `Attachment for Submodel with id ${submodelId} at path ${submodelElementPath} not found in any repository`,
        );
    }

    async getSubmodelReferencesFromShellFromAllRepos(aasId: string) {
        return this.getFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getSubmodelReferencesFromShellFromRepo(basePath, aasId),
            `Submodel references for '${aasId}' not found in any repository`
        );
    }

    async getSubmodelReferencesFromShellFromDefaultRepo(aasId: string): Promise<ApiResponseWrapper<Reference[]>> {
        const client = this.getDefaultAasRepositoryClient();
        if (!client) return noDefaultAasRepository();
        const response = await client.getSubmodelReferencesFromShell(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `Submodel references for '${aasId}' not found in default repository`,
        );
    }

    private async getSubmodelReferencesFromShellFromRepo(aasId: string, repoUrl: string) {
        const client = this.getAasRepositoryClient(repoUrl);
        const response = await client.getSubmodelReferencesFromShell(aasId);
        if (response.isSuccess) return response;
        return Promise.reject(`Unable to fetch submodel references for AAS '${aasId}' from '${repoUrl}'`);
    }

    async getFirstSubmodelReferencesFromShellFromAllRepos(aasId: string) {
        return this.getFirstFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getSubmodelReferencesFromShellFromRepo(basePath, aasId),
            `Submodel references for '${aasId}' not found in any repository`,
        );
    }

    async getAasThumbnailFromAllRepos(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult<Blob>[]>> {
        return this.getFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getAasThumbnailFromRepo(aasId, basePath),
            `Thumbnail for '${aasId}' not found in any repository`
        );
    }

    async getAasThumbnailFromDefaultRepo(aasId: string): Promise<ApiResponseWrapper<Blob>> {
        const client = this.getDefaultAasRepositoryClient();
        if (!client) return noDefaultAasRepository();
        const response = await client.getThumbnailFromShell(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, `Thumbnail for '${aasId}' not found in default repository`);
    }

    private async getAasThumbnailFromRepo(aasId: string, repoUrl: string) {
        const client = this.getAasRepositoryClient(repoUrl);
        const response = await client.getThumbnailFromShell(aasId);
        if (response.isSuccess) return response;
        return Promise.reject(`Unable to fetch thumbnail for AAS '${aasId}' from '${repoUrl}'`);
    }

    async getFirstAasThumbnailFromAllRepos(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult<Blob>>> {
        return this.getFirstFromAllRepos(
            await this.getAasRepositories(),
            (basePath) => this.getAasThumbnailFromRepo(aasId, basePath),
            `Thumbnail for '${aasId}' not found in any repository`,
        );
    }

    async getFirstFromAllRepos<T>(
        basePathUrls: string[],
        kernel: (url: string) => Promise<ApiResponseWrapper<T>>,
        errorMsg: string
    ): Promise<ApiResponseWrapper<RepoSearchResult<T>>> {
        const promises = basePathUrls.map(async (url) =>
            kernel(url).then((response: ApiResponseWrapper<T>) => {
                if (!response.isSuccess) return Promise.reject('Fetch call was not successful');
                return { searchResult: response.result, location: url };
            }),
        );

        try {
            const firstResult = await Promise.any(promises);
            return wrapSuccess(firstResult);
        } catch {
            return wrapErrorCode(ApiResultStatus.NOT_FOUND, errorMsg);
        }
    }

    private getDefaultAasRepositoryClient() {
        const defaultUrl = process.env.AAS_REPO_API_URL;
        if (!defaultUrl) return null;
        return this.getAasRepositoryClient(defaultUrl);
    }

    private getDefaultSubmodelRepositoryClient() {
        const defaultUrl = process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL;
        if (!defaultUrl) return null;
        return this.getSubmodelRepositoryClient(defaultUrl);
    }

    async getFromAllRepos<T>(
        basePathUrls: string[],
        kernel: (url: string) => Promise<ApiResponseWrapper<T>>,
        errorMsg: string,
    ): Promise<ApiResponseWrapper<RepoSearchResult<T>[]>> {
        const promises = basePathUrls.map(async (url) =>
            kernel(url).then((response: ApiResponseWrapper<T>) => {
                return { searchResult: response, location: url };
            }),
        );

        const responses = await Promise.allSettled(promises);
        const fulfilledResponses = responses.filter(
            (result) => result.status === 'fulfilled' && result.value.searchResult.isSuccess
        );

        if (fulfilledResponses.length <= 0) {
            return wrapErrorCode(ApiResultStatus.NOT_FOUND, errorMsg);
        }

        return wrapSuccess<RepoSearchResult<T>[]>(
            fulfilledResponses.map(
                (
                    result: PromiseFulfilledResult<{
                        searchResult: ApiResponseWrapper<T>;
                        location: string;
                    }>,
                ) => ({ searchResult: result.value.searchResult.result!, location: result.value.location }),
            ),
        );
    }

    private async getAasFromRepo(
        aasId: string,
        repoUrl: string
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const client = this.getAasRepositoryClient(repoUrl);
        const response = await client.getAssetAdministrationShellById(aasId);
        if (response.isSuccess) return response;
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, `AAS '${aasId}' not found in repository '${repoUrl}'`);
    }
}
