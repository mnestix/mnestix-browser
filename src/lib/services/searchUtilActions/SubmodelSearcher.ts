import { Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { MultipleRepositorySearchService } from 'lib/services/MultipleRepositorySearch/MultipleRepositorySearchService';
import { getSubmodelFromEndpoint } from 'lib/api/serverFetch';

export class SubmodelSearcher {
    private constructor(
        protected readonly submodelRepositoryClient: ISubmodelRepositoryApi,
        protected readonly submodelRegistryClient: ISubmodelRegistryServiceApiInterface,
        protected readonly multipleDataSource: MultipleRepositorySearchService,
    ) {}

    static create(): SubmodelSearcher {
        const multipleDataSource = MultipleRepositorySearchService.create();
        const submodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        });
        const submodelRegistryClient = SubmodelRegistryServiceApi.create(
            process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL,
            mnestixFetch(),
        );

        return new SubmodelSearcher(submodelRepositoryClient, submodelRegistryClient, multipleDataSource);
    }

    async performSubmodelFullSearch(submodelReference: Reference, submodelDescriptor?: SubmodelDescriptor) {
        const submodelId = submodelReference.keys[0].value;

        const descriptor =
            submodelDescriptor ||
            (process.env.SUBMODEL_REGISTRY_API_URL ? await this.getSubmodelDescriptorById(submodelId) : null);
        const endpoint = descriptor?.endpoints[0].protocolInformation.href;

        if (endpoint) {
            return await this.getSubmodelFromEndpoint(endpoint);
        }

        const submodelFromDefaultRepo = await this.getSubmodelById(submodelId);
        if (submodelFromDefaultRepo) {
            return submodelFromDefaultRepo;
        }

        const submodelFromAllRepos = await this.getSubmodelFromAllRepos(submodelId);
        if (submodelFromAllRepos) {
            return submodelFromAllRepos;
        }

        return null;
    }

    async getSubmodelDescriptorById(submodelId: string): Promise<SubmodelDescriptor | null> {
        try {
            return await this.submodelRegistryClient.getSubmodelDescriptorById(submodelId);
        } catch (e) {
            if (!(e instanceof TypeError || (e instanceof Response && e.status === 404))) {
                console.error(e);
            }
            return null;
        }
    }

    async getSubmodelFromEndpoint(endpoint: string): Promise<Submodel | null> {
        try {
            return await getSubmodelFromEndpoint(endpoint);
        } catch (e) {
            if (!(e instanceof TypeError || (e instanceof Response && e.status === 404))) {
                console.error(e);
            }
            return null;
        }
    }

    async getSubmodelById(submodelId: string): Promise<Submodel | null> {
        try {
            return await this.submodelRepositoryClient.getSubmodelById(submodelId);
        } catch (e) {
            if (!(e instanceof TypeError || (e instanceof Response && e.status === 404))) {
                console.error(e);
            }
            return null;
        }
    }

    async getSubmodelFromAllRepos(submodelId: string): Promise<Submodel | null> {
        try {
            return await this.multipleDataSource.getSubmodelFromAllRepos(submodelId);
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
