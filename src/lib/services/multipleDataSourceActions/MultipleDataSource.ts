import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { PrismaConnector } from 'app/[locale]/settings/_components/mnestix-connections/PrismaConnector';
import { IPrismaConnector } from 'app/[locale]/settings/_components/mnestix-connections/PrismaConnectorInterface';

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};

export interface NullableMultipleDataSourceSetupParameters {
    shellsByRegistryEndpoint?: { path: string; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepositories?: INullableAasRepositoryEntries[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    log?: Log | null;
}

export class MultipleDataSource {
    private constructor(
        protected readonly repositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly submodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly prismaConnector: IPrismaConnector,
        protected readonly fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
        protected readonly log: Log,
    ) {}

    static create(): MultipleDataSource {
        const repositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: process.env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        });
        const submodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: process.env.SUBMODEL_REPO_API_URL,
            fetch: mnestixFetch(),
        });
        const log = Log.create();
        const prismaConnector = PrismaConnector.create();
        return new MultipleDataSource(repositoryClient, submodelRepositoryClient, prismaConnector, fetch, log);
    }

    static createNull({
        shellsByRegistryEndpoint = [],
        shellsSavedInTheRepositories = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableMultipleDataSourceSetupParameters = {}): MultipleDataSource {
        const stubbedFetch = async (input: RequestInfo | URL): Promise<Response> => {
            if (!shellsByRegistryEndpoint) return Promise.reject(new Error('no registry configuration'));
            for (const aasEntry of shellsByRegistryEndpoint) {
                if (aasEntry.path === input) return new Response(JSON.stringify(aasEntry.aas));
            }
            return Promise.reject(new Error('no aas for on href:' + input));
        };
        const aasUrls = [...new Set(shellsSavedInTheRepositories?.map((entry) => entry.repositoryUrl))];
        return new MultipleDataSource(
            AssetAdministrationShellRepositoryApi.createNull({ shellsSavedInTheRepositories }),
            SubmodelRepositoryApi.createNull({ submodelsSavedInTheRepository }),
            PrismaConnector.createNull({ aasUrls }),
            stubbedFetch,
            log ?? Log.createNull(),
        );
    }

    async getAasFromAllRepos(aasId: string): Promise<RepoSearchResult[]> {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });

        const promises = basePathUrls.map(
            (url) =>
                this.repositoryClient
                    .getAssetAdministrationShellById(aasId, undefined, url)
                    .then((aas) => ({ aas: aas, location: url })), // add the URL to the resolved value
        );

        const results = await Promise.allSettled(promises);
        const fulfilledResults = results.filter((result) => result.status === 'fulfilled');

        if (fulfilledResults.length > 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return fulfilledResults.map((result) => (result as unknown).value);
        } else {
            throw new Error('AAS not found');
        }
    }

    async getAasFromDefaultRepository(aasId: string): Promise<AssetAdministrationShell> {
        return this.repositoryClient.getAssetAdministrationShellById(aasId);
    }

    async getSubmodelFromAllRepos(submodelId: string) {
        const basePathUrls = await this.prismaConnector.getConnectionDataByTypeAction({
            id: '0',
            typeName: 'AAS_REPOSITORY',
        });
        const promises = basePathUrls.map((url) =>
            this.submodelRepositoryClient.getSubmodelById(submodelId, undefined, url),
        );

        try {
            return await Promise.any(promises);
        } catch (error) {
            throw new Error('Submodel not found');
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
            throw new Error('Image not found');
        }
    }
}
