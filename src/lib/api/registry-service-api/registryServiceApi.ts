import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { RegistryServiceApiInMemory } from 'lib/api/registry-service-api/registryServiceApiInMemory';

export class RegistryServiceApi implements IRegistryServiceApi {
    baseUrl: string;

    constructor(
        protected _baseUrl: string = '',
        protected http: {
            fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
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

    static createNull(options: { registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null }) {
        return new RegistryServiceApiInMemory(options);
    }

    async getAllAssetAdministrationShellDescriptors() {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL('/shell-descriptors', this.baseUrl);

        const response = await this.http.fetch(url.toString(), {
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

        const url = new URL(`/shell-descriptors/${b64_aasId}`, this.baseUrl);

        const response = await this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
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

        const url = new URL('/shell-descriptors', this.baseUrl);

        const response = await this.http.fetch(url.toString(), {
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

        const url = new URL(`/shell-descriptors/${b64_aasId}`, this.baseUrl);

        const response = await this.http.fetch(url.toString(), {
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

        const url = new URL(`/shell-descriptors/${b64_aasId}`, this.baseUrl);

        const response = await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });

        if (response.ok) {
            return response;
        } else {
            throw response;
        }
    }
}
