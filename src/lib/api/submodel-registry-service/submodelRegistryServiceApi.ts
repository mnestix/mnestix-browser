import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { encodeBase64 } from 'lib/util/Base64Util';

export class SubmodelRegistryServiceApi {
    baseUrl: string;

    constructor(protected _baseUrl: string = '') {
        this.baseUrl = _baseUrl;
    }

    public async getSubmodelDescriptorsById(submodelId: string) {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        const response = await fetch(url, {
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

        const response = await fetch(url, {
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

        const response = await fetch(url, {
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

        const response = await fetch(url, {
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

        const response = await fetch(url, {
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

        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (response.ok) {
            return response;
        } else {
            throw response;
        }
    }
}
