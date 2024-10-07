import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';

export class SubmodelRegistryServiceApi {
    baseUrl: string;
    private http: { fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> };

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

    public async getSubmodelDescriptorsById(submodelId: string) {
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

    public async putSubmodelDescriptorsById(submodelId: string, submodelDescriptor: SubmodelDescriptor) {
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

    public async deleteSubmodelDescriptorsById(submodelId: string) {
        const b64_submodelId = encodeBase64(submodelId);

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        const response = await this.http.fetch(url.toString(), {
            method: 'DELETE',
        });

        if (response.ok) {
            return response;
        } else {
            throw response;
        }
    }

    public async getAllSubmodelDescriptors() {
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

    public async postSubmodelDescriptor(submodelDescriptor: SubmodelDescriptor) {
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

    public async deleteAllSubmodelDescriptors() {
        const url = new URL(`${this.baseUrl}/submodel-descriptors`);

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
