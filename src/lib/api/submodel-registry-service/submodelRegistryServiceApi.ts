import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';
import { FetchAPI } from 'lib/api/basyx-v3/api';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class SubmodelRegistryServiceApi implements ISubmodelRegistryServiceApiInterface {
    baseUrl: string;
    http: FetchAPI;

    constructor(http: FetchAPI, _baseUrl: string = '') {
        this.http = http;
        this.baseUrl = _baseUrl;
    }

    static create(_baseUrl: string | undefined, mnestixFetch: FetchAPI) {
        return new SubmodelRegistryServiceApi(mnestixFetch, _baseUrl);
    }

    async getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

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

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        return await this.http.fetch(url.toString(), {
            method: 'PUT',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });
    }

    async deleteSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<void>> {
        const b64_submodelId = encodeBase64(submodelId);

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        return await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });
    }

    async getAllSubmodelDescriptors(): Promise<ApiResponseWrapper<SubmodelDescriptor[]>> {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

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

        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

        return await this.http.fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });
    }

    async deleteAllSubmodelDescriptors(): Promise<ApiResponseWrapper<void>> {
        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

        return this.http.fetch(url.toString(), {
            method: 'DELETE',
        });
    }
}
