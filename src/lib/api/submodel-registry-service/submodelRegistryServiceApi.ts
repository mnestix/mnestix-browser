import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { FetchAPI } from 'lib/api/basyx-v3/api';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

export class SubmodelRegistryServiceApi implements ISubmodelRegistryServiceApiInterface {
    constructor(
        private baseUrl: string,
        private http: FetchAPI,
    ) {}

    static create(baseUrl: string, mnestixFetch: FetchAPI) {
        return new SubmodelRegistryServiceApi(baseUrl, mnestixFetch);
    }

    getBasePath(): string {
        return this.baseUrl;
    }

    async getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`submodel-descriptors/${b64_submodelId}`, this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });
    }

    async putSubmodelDescriptorById(
        submodelId: string,
        submodelDescriptor: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`submodel-descriptors/${b64_submodelId}`, this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'PUT',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });
    }

    async deleteSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<void>> {
        const b64_submodelId = encodeBase64(submodelId);

        const url = new URL(`submodel-descriptors/${b64_submodelId}`, this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });
    }

    async getAllSubmodelDescriptors(): Promise<ApiResponseWrapper<SubmodelDescriptor[]>> {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL('submodel-descriptors', this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });
    }

    async postSubmodelDescriptor(
        submodelDescriptor: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL('submodel-descriptors', this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });
    }

    async deleteAllSubmodelDescriptors(): Promise<ApiResponseWrapper<void>> {
        const url = new URL('submodel-descriptors', this.baseUrl);

        return this.http.fetch(url.toString(), {
            method: 'DELETE',
        });
    }

    async getSubmodelFromEndpoint(endpoint: string): Promise<ApiResponseWrapper<Submodel>> {
        return this.http.fetch<Submodel>(endpoint.toString(), {
            method: 'GET',
        });
    }
}
