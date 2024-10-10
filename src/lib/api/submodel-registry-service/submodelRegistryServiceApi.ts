import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';
import { ISubmodelRegistryServiceApiInterface } from 'lib/api/submodel-registry-service/ISubmodelRegistryServiceApiInterface';

export class SubmodelRegistryServiceApi implements ISubmodelRegistryServiceApiInterface {
    baseUrl: string;
    http: { fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> };

    constructor(
        _baseUrl: string = '',
        http:
            | {
                  fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
              }
            | undefined,
    ) {
        this.baseUrl = _baseUrl;
        this.http = http ?? window;
    }

    static create(
        _baseUrl: string | undefined,
        mnestixFetch:
            | {
                  fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
              }
            | undefined,
    ) {
        return new SubmodelRegistryServiceApi(_baseUrl, mnestixFetch ?? window);
    }

    async getSubmodelDescriptorById(submodelId: string) {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

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

    async putSubmodelDescriptorById(submodelId: string, submodelDescriptor: SubmodelDescriptor) {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        const response = await this.http.fetch(url.toString(), {
            method: 'PUT',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async deleteSubmodelDescriptorById(submodelId: string) {
        const b64_submodelId = encodeBase64(submodelId);

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        const response = await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async getAllSubmodelDescriptors() {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

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

    async postSubmodelDescriptor(submodelDescriptor: SubmodelDescriptor) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

        const response = await this.http.fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(submodelDescriptor),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    async deleteAllSubmodelDescriptors() {
        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

        const response = await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }
}
