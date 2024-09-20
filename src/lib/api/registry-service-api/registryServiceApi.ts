import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import {
    INullableAasRegistryEndpointEntries,
    RegistryServiceApiInMemory,
} from 'lib/api/registry-service-api/registryServiceApiInMemory';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';

export class RegistryServiceApi implements IRegistryServiceApi {
    baseUrl: string;

    constructor(
        protected _baseUrl: string = '',
        protected http: {
            fetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response>;
        },
    ) {
        this.baseUrl = _baseUrl;
    }

    static create(
        _baseUrl: string | undefined,
        mnestixFetch:
            | {
                  fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
              }
            | undefined,
    ) {
        return new RegistryServiceApi(_baseUrl, mnestixFetch ?? window);
    }

    static createNull(options: {
        registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
        shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;
    }) {
        return new RegistryServiceApiInMemory(options);
    }

    async getAllAssetAdministrationShellDescriptors() {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors`);

        const response = await this.http.fetch(url, {
            method: 'GET',
            headers,
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async getAssetAdministrationShellDescriptorById(aasId: string) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors/${b64_aasId}`);

        const response = await this.http.fetch(url, {
            method: 'GET',
            headers,
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async getAssetAdministrationShellFromEndpoint(endpoint: URL): Promise<AssetAdministrationShell> {
        const response = await this.http.fetch(endpoint.toString(), {
            method: 'GET',
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async postAssetAdministrationShellDescriptor(shellDescriptor: AssetAdministrationShellDescriptor) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors`);

        const response = await this.http.fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(shellDescriptor),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor,
    ) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors/${b64_aasId}`);

        const response = await this.http.fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(shellDescriptor),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async deleteAssetAdministrationShellDescriptorById(aasId: string) {
        const b64_aasId = encodeBase64(aasId);

        const url = new URL(`${this.baseUrl}/shell-descriptors/${b64_aasId}`);

        const response = await this.http.fetch(url, {
            method: 'DELETE',
        });

        if (response.ok) {
            return response;
        } else {
            throw response;
        }
    }
}
