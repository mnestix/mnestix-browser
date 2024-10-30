import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import {
    INullableAasRegistryEndpointEntries,
    RegistryServiceApiInMemory,
} from 'lib/api/registry-service-api/registryServiceApiInMemory';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class RegistryServiceApi implements IRegistryServiceApi {
    baseUrl: string;

    constructor(
        protected http: {
            fetch<T>(url: RequestInfo | URL, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
        protected _baseUrl: string = '',
    ) {
        this.baseUrl = _baseUrl;
    }

    static create(
        _baseUrl: string | undefined,
        mnestixFetch: {
            fetch<T>(url: RequestInfo, init?: RequestInit | undefined): Promise<ApiResponseWrapper<T>>;
        },
    ) {
        return new RegistryServiceApi(mnestixFetch, _baseUrl);
    }

    static createNull(options: {
        registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
        shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;
    }) {
        return new RegistryServiceApiInMemory(options);
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

    async getAssetAdministrationShellFromEndpoint(
        endpoint: URL,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        return this.http.fetch(endpoint.toString(), {
            method: 'GET',
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
}
