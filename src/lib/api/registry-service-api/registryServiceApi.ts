import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';

export class RegistryServiceApi implements IRegistryServiceApi {
    baseUrl: string;

    constructor(protected _baseUrl: string = '') {
        this.baseUrl = _baseUrl;
    }

    async getAllAssetAdministrationShellDescriptors() {
        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors`);

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

    async getAssetAdministrationShellDescriptorById(aasId: string) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors/${b64_aasId}`);

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

    async postAssetAdministrationShellDescriptor(shellDescriptor: AssetAdministrationShellDescriptor) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/shell-descriptors`);

        const response = await fetch(url, {
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

        const response = await fetch(url, {
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
