import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';
import { ISubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApi';
import { FetchAPI } from 'lib/api/basyx-v3/api';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ServiceReachable } from 'lib/services/transfer-service/TransferService';

export class SubmodelRegistryServiceApi implements ISubmodelRegistryServiceApi {
    constructor(
        private baseUrl: string,
        private http: FetchAPI,
    ) {}

    static create(baseUrl: string, mnestixFetch: FetchAPI) {
        return new SubmodelRegistryServiceApi(baseUrl, mnestixFetch);
    }

    static createNull(
        baseUrl: string,
        registrySubmodelDescriptors: SubmodelDescriptor[],
        reachable: ServiceReachable = ServiceReachable.Yes,
    ) {
        return new SubmodelRegistryServiceApiInMemory(baseUrl, registrySubmodelDescriptors, reachable);
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

class SubmodelRegistryServiceApiInMemory implements ISubmodelRegistryServiceApi {
    constructor(
        protected baseUrl: string,
        protected registrySubmodelDescriptors: SubmodelDescriptor[],
        protected reachable: ServiceReachable,
    ) {}

    getBasePath(): string {
        return this.baseUrl;
    }

    async getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        const foundDescriptor = this.registrySubmodelDescriptors.find((descriptor) => descriptor.id === submodelId);
        if (foundDescriptor) return wrapSuccess(foundDescriptor);
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `No Submodel descriptor for submodel id '${submodelId}' found in '${this.getBasePath()}'`,
        );
    }

    putSubmodelDescriptorById(
        _submodelId: string,
        _submodelDescriptor: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        throw new Error('Method not implemented.');
    }

    deleteSubmodelDescriptorById(_submodelId: string): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    async getAllSubmodelDescriptors(): Promise<ApiResponseWrapper<SubmodelDescriptor[]>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        return wrapSuccess(this.registrySubmodelDescriptors);
    }

    postSubmodelDescriptor(_submodelDescriptor: SubmodelDescriptor): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
        throw new Error('Method not implemented.');
    }

    deleteAllSubmodelDescriptors(): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    getSubmodelFromEndpoint(_endpoint: string): Promise<ApiResponseWrapper<Submodel>> {
        throw new Error('Method not implemented.');
    }
}
