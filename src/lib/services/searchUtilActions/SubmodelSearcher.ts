import { Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { ApiResponseWrapper, ApiResultStatus, wrapErrorCode } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { RepositorySearchService } from 'lib/services/repository-access/RepositorySearchService';

export class SubmodelSearcher {
    private constructor(
        protected readonly getSubmodelRegistryClient: (basePath: string) => ISubmodelRegistryServiceApiInterface,
        protected readonly multipleDataSource: RepositorySearchService,
    ) {}

    static create(): SubmodelSearcher {
        const getRepositoryClient = (baseUrl: string) => SubmodelRepositoryApi.create(baseUrl, mnestixFetch());
        const getRegistryClient = (baseUrl: string) => SubmodelRegistryServiceApi.create(baseUrl, mnestixFetch());
        const multipleDataSource = RepositorySearchService.create();

        return new SubmodelSearcher(getRepositoryClient, getRegistryClient, multipleDataSource);
    }

    private readonly failureMessage = 'Submodel not found';

    async performSubmodelFullSearch(
        submodelReference: Reference,
        submodelDescriptor?: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<Submodel>> {
        const submodelId = submodelReference.keys[0].value;

        const descriptorById = await this.getSubmodelDescriptorById(submodelId);
        const descriptor =
            submodelDescriptor || (process.env.SUBMODEL_REGISTRY_API_URL && descriptorById.isSuccess)
                ? descriptorById.result
                : null;
        const endpoint = descriptor?.endpoints[0].protocolInformation.href;

        if (endpoint) {
            return await this.getSubmodelFromEndpoint(endpoint);
        }

        const submodelFromDefaultRepo = await this.getSubmodelById(submodelId);
        if (submodelFromDefaultRepo.isSuccess) {
            return submodelFromDefaultRepo;
        }

        const submodelFromAllRepos = await this.getSubmodelFromAllRepos(submodelId);
        if (submodelFromAllRepos.isSuccess) {
            return submodelFromAllRepos;
        }

        return wrapErrorCode<Submodel>(ApiResultStatus.NOT_FOUND, this.failureMessage);
    }

    async getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        const response = await this.submodelRegistryClient.getSubmodelDescriptorById(submodelId);
        if (response.isSuccess) return response;
        else {
            if (response.errorCode === ApiResultStatus.NOT_FOUND) {
                console.error(response.message);
            }
            return wrapErrorCode<SubmodelDescriptor>(ApiResultStatus.NOT_FOUND, 'Submodel not found');
        }
    }

    async getSubmodelById(submodelId: string): Promise<ApiResponseWrapper<Submodel>> {
        const response = await this.submodelRepositoryClient.getSubmodelById(submodelId);
        if (response.isSuccess) return response;
        else {
            if (response.errorCode === ApiResultStatus.NOT_FOUND) {
                console.error(response.message);
            }
            return wrapErrorCode<Submodel>(ApiResultStatus.NOT_FOUND, 'Submodel not found');
        }
    }

    async getSubmodelFromAllRepos(submodelId: string): Promise<ApiResponseWrapper<Submodel>> {
        const response = await this.multipleDataSource.getSubmodelFromAllRepos(submodelId);
        if (response.isSuccess) return response;
        else {
            if (response.errorCode === ApiResultStatus.NOT_FOUND) {
                console.error(response.message);
            }
            return wrapErrorCode<Submodel>(ApiResultStatus.NOT_FOUND, 'Submodel not found');
        }
    }

    async getSubmodelFromEndpoint(endpoint: string): Promise<ApiResponseWrapper<Submodel>> {
        const response = await this.getSubmodelRegistryClient('').getSubmodelFromEndpoint(endpoint);
        if (response.isSuccess) return response;
        if (response.errorCode === ApiResultStatus.NOT_FOUND) {
            console.error(response.message);
        }
        return wrapErrorCode<Submodel>(ApiResultStatus.NOT_FOUND, `Submodel not found at endpoint '${endpoint}'`);
    }
}
