import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ApiResponseWrapper, ApiResultStatus, wrapErrorCode, wrapResponse } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export interface INullableAasRegistryEndpointEntries {
    endpoint: URL | string;
    aas: AssetAdministrationShell;
}

export class RegistryServiceApiInMemory implements IRegistryServiceApi {
    private readonly registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
    private readonly shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;
    baseUrl: string;

    constructor(options: {
        registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
        shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;
    }) {
        this.registryShellDescriptorEntries = options.registryShellDescriptorEntries;
        this.shellsAvailableOnEndpoints = options.shellsAvailableOnEndpoints;
    }

    postAssetAdministrationShellDescriptor(
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    async getAssetAdministrationShellDescriptorById(
        aasId: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        if (!this.registryShellDescriptorEntries) return Promise.reject(new Error('no registry configuration'));
        let shellDescriptor: AssetAdministrationShellDescriptor;
        for (shellDescriptor of this.registryShellDescriptorEntries) {
            if (shellDescriptor.id === aasId) {
                const response = new Response(JSON.stringify(shellDescriptor));
                const value = await wrapResponse<AssetAdministrationShellDescriptor>(response);
                return Promise.resolve(value);
            }
        }
        return Promise.resolve(wrapErrorCode(ApiResultStatus.NOT_FOUND, 'no shell descriptor for aasId:' + aasId));
    }

    async getAssetAdministrationShellFromEndpoint(
        endpoint: URL,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (!this.shellsAvailableOnEndpoints) return Promise.reject(new Error('no registry configuration'));
        let registryEndpoint: INullableAasRegistryEndpointEntries;
        for (registryEndpoint of this.shellsAvailableOnEndpoints) {
            if (registryEndpoint.endpoint.toString() === endpoint.toString()) {
                const value = await wrapResponse<AssetAdministrationShell>(
                    new Response(JSON.stringify(registryEndpoint.aas)),
                );
                return Promise.resolve(value);
            }
        }
        return Promise.resolve(wrapErrorCode(ApiResultStatus.NOT_FOUND, 'no shell for url:' + endpoint));
    }

    async putAssetAdministrationShellDescriptorById(
        _aasId: string,
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        throw new Error('Method not implemented.');
    }
}
