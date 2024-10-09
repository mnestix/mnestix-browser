import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch, mnestixFetchLegacy } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { PrismaConnector } from 'lib/services/prisma/PrismaConnector';
import { IPrismaConnector } from 'lib/services/prisma/PrismaConnectorInterface';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { NotFoundError } from 'lib/errors/NotFoundError';

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

    async getAasFromDefaultRepository(aasId: string): Promise<AssetAdministrationShell> {
        try {
            return await this.repositoryClient.getAssetAdministrationShellById(aasId);
        } catch (e) {
            throw new NotFoundError('AAS not found');
        }
    }

    async getAasFromRepo(aasId: string, repoUrl: string): Promise<AssetAdministrationShell> {
        try {
            return await this.repositoryClient.getAssetAdministrationShellById(aasId, undefined, repoUrl);
        } catch (e) {
            throw new NotFoundError(`AAS '${aasId}' not found in repository '${repoUrl}'`);
        }
    }

    async getAasFromAllRepos(aasId: string): Promise<RepoSearchResult[]> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map(
            (url) => this.getAasFromRepo(aasId, url).then((aas) => ({ aas: aas, location: url })), // add the URL to the resolved value
        );

        const results = await Promise.allSettled(promises);
        const fulfilledResults = results.filter((result) => result.status === 'fulfilled');

        if (fulfilledResults.length > 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return fulfilledResults.map((result) => (result as unknown).value);
        } else {
            throw new NotFoundError(`Could not find AAS ${aasId} in any Repository`);
        }
    }

    async getSubmodelById(id: string): Promise<Submodel> {
        try {
            return this.submodelRepositoryClient.getSubmodelById(id);
        } catch (error) {
            throw new NotFoundError(`Submodel with id ${id} not found`);
        }
    }

    async getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string): Promise<Blob> {
        try {
            return this.submodelRepositoryClient.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
        } catch (error) {
            throw new NotFoundError(
                `Attachment for Submodel with id ${submodelId} at path ${submodelElementPath} not found`,
            );
        }
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
        try {
            return await this.repositoryClient.getSubmodelReferencesFromShell(aasId);
        } catch (e) {
            throw new NotFoundError('Submodel Reference not found');
        }
    }

    async getThumbnailFromShell(aasId: string): Promise<Blob> {
        try {
            return await this.repositoryClient.getThumbnailFromShell(aasId);
        } catch (e) {
            throw new NotFoundError('Thumbnail not found');
        }
    }

    async getAasThumbnailFromAllRepos(aasId: string) {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map((url) =>
            this.repositoryClient.getThumbnailFromShell(aasId, undefined, url).then((image) => {
                if (image.size === 0) {
                    throw new Error('Empty image');
                }
                return image;
            }),
        );

        try {
            return await Promise.any(promises);
        } catch {
            throw new NotFoundError('Image not found');
        }
    }
}
