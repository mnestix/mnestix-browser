import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export type AasRegistryEndpointEntryInMemory = {
    endpoint: URL | string;
    aas: AssetAdministrationShell;
};

export class RegistryServiceApiInMemory implements IRegistryServiceApi {
    constructor(
        protected baseUrl: string,
        protected registryShellDescriptors: AssetAdministrationShellDescriptor[],
        protected registryShellEndpoints: AasRegistryEndpointEntryInMemory[],
    ) {}

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async postAssetAdministrationShellDescriptor(
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    async getAssetAdministrationShellDescriptorById(
        aasId: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        const foundDescriptor = this.registryShellDescriptors.find((shellDescriptor) => shellDescriptor.id === aasId);
        if (!foundDescriptor) {
            return Promise.resolve(
                wrapErrorCode(
                    ApiResultStatus.NOT_FOUND,
                    `no shell descriptor for aasId '${aasId}' found in registry '${this.baseUrl}'`,
                ),
            );
        }

        const response = new Response(JSON.stringify(foundDescriptor));
        const value = await wrapResponse<AssetAdministrationShellDescriptor>(response);
        return Promise.resolve(value);
    }

    async getAssetAdministrationShellFromEndpoint(
        endpoint: URL,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const foundEndpoint = this.registryShellEndpoints.find(
            (shellEndpoint) => shellEndpoint.endpoint.toString() === endpoint.toString(),
        );
        if (!foundEndpoint) {
            return Promise.resolve(
                wrapErrorCode(
                    ApiResultStatus.NOT_FOUND,
                    `no shell for endpoint '${endpoint}' found in registry '${this.getBaseUrl()}`,
                ),
            );
        }

        const value = await wrapResponse<AssetAdministrationShell>(new Response(JSON.stringify(foundEndpoint.aas)));
        return Promise.resolve(value);
    }

    async putAssetAdministrationShellDescriptorById(
        _aasId: string,
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        throw new Error('Method not implemented.');
    }
}
