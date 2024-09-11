import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Log } from 'lib/util/Log';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { getConnectionDataByTypeAction } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

export type RepoSearchResult = {
    aas: AssetAdministrationShell;
    location: string;
};

interface NullableSearchSetupParameters {
    shellsByRegistryEndpoint?: { path: string; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepository?: AssetAdministrationShell[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    log?: Log | null;
}

export class MultipleDataSource {
    private constructor(
        protected readonly repositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly submodelRepositoryClient: ISubmodelRepositoryApi,
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
        return new MultipleDataSource(repositoryClient, submodelRepositoryClient, fetch, log);
    }

    static createNull({
        shellsByRegistryEndpoint = [],
        shellsSavedInTheRepository = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableSearchSetupParameters = {}): MultipleDataSource {
        const stubbedFetch = async (input: RequestInfo | URL): Promise<Response> => {
            if (!shellsByRegistryEndpoint) return Promise.reject(new Error('no registry configuration'));
            for (const aasEntry of shellsByRegistryEndpoint) {
                if (aasEntry.path === input) return new Response(JSON.stringify(aasEntry.aas));
            }
            return Promise.reject(new Error('no aas for on href:' + input));
        };
        return new MultipleDataSource(
            AssetAdministrationShellRepositoryApi.createNull({ shellsSavedInTheRepository }),
            SubmodelRepositoryApi.createNull({ submodelsSavedInTheRepository }),
            stubbedFetch,
            log ?? Log.createNull(),
        );
    }

    async getAasFromAllRepos(aasId: string): Promise<RepoSearchResult[]> {
        const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

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

    async getSubmodelFromAllRepos(submodelId: string) {
        const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });
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
        const basePathUrls = await getConnectionDataByTypeAction({ id: '0', typeName: 'AAS_REPOSITORY' });

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
