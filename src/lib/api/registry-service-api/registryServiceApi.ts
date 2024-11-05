import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import {
    AasRegistryEndpointEntryInMemory,
    RegistryServiceApiInMemory,
} from 'lib/api/registry-service-api/registryServiceApiInMemory';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class RegistryServiceApi implements IRegistryServiceApi {
    constructor(
        protected baseUrl: string = '',
        protected http: {
            fetch<T>(url: RequestInfo | URL, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
    ) {}

    static create(
        baseUrl: string,
        mnestixFetch: {
            fetch<T>(url: RequestInfo, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
    ) {
        return new RegistryServiceApi(baseUrl, mnestixFetch);
    }

    static createNull(
        baseUrl: string,
        registryShellDescriptors: AssetAdministrationShellDescriptor[],
        registryShellEndpoints: AasRegistryEndpointEntryInMemory[],
    ) {
        return new RegistryServiceApiInMemory(baseUrl, registryShellDescriptors, registryShellEndpoints);
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async getAssetAdministrationShellDescriptorById(
        aasId: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`/shell-descriptors/${b64_aasId}`, this.baseUrl);

        return this.http.fetch(url, {
            method: 'GET',
            headers,
        });
    }

    async postAssetAdministrationShellDescriptor(
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<void>> {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL('/shell-descriptors', this.baseUrl);

        return await this.http.fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(shellDescriptor),
        });
    }

    async putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`/shell-descriptors/${b64_aasId}`, this.baseUrl);

        return this.http.fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(shellDescriptor),
        });
    }

    async getAssetAdministrationShellFromEndpoint(endpoint: UR): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        return this.http.fetch<AssetAdministrationShell>(endpoint.toString(), {
            method: 'GET',
        });
    }
}
