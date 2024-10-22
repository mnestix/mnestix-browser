import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ApiResponseWrapper, ApiResponseWrapperUtil } from 'lib/services/apiResponseWrapper';

export interface INullableAasRegistryEndpointEntries {
    endpoint: URL | string;
    aas: AssetAdministrationShell;
}

export class RegistryServiceApiInMemory implements IRegistryServiceApi {
    private registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
    baseUrl: string;
    _baseUrl: string;
    private shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;

    constructor(options: {
        registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
        shellsAvailableOnEndpoints: INullableAasRegistryEndpointEntries[] | null;
    }) {
        this.registryShellDescriptorEntries = options.registryShellDescriptorEntries;
        this.shellsAvailableOnEndpoints = options.shellsAvailableOnEndpoints;
    }

    async getAssetAdministrationShellDescriptorById(
        aasId: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        if (!this.registryShellDescriptorEntries) return Promise.reject(new Error('no registry configuration'));
        let shellDescriptor: AssetAdministrationShellDescriptor;
        for (shellDescriptor of this.registryShellDescriptorEntries) {
            if (shellDescriptor.id === aasId) {
                const response = new Response(JSON.stringify(shellDescriptor));
                const value = await ApiResponseWrapperUtil.fromResponse<AssetAdministrationShellDescriptor>(response);
                return Promise.resolve(value);
            }
        }
        return Promise.resolve(
            ApiResponseWrapperUtil.fromHttpError(
                404,
                'no shell descriptor for aasId:' + aasId,
            ),
        );
    }

    async getAssetAdministrationShellFromEndpoint(
        endpoint: URL,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (!this.shellsAvailableOnEndpoints) return Promise.reject(new Error('no registry configuration'));
        let registryEndpoint: INullableAasRegistryEndpointEntries;
        for (registryEndpoint of this.shellsAvailableOnEndpoints) {
            if (registryEndpoint.endpoint.toString() === endpoint.toString())
            {
                const value = await ApiResponseWrapperUtil.fromResponse<AssetAdministrationShell>(new Response(JSON.stringify(registryEndpoint.aas)));
                return Promise.resolve(value);
            }
        }
        return Promise.resolve(
            ApiResponseWrapperUtil.fromHttpError(404, 'no shell for url:' + endpoint),
        );
    }

    putAssetAdministrationShellDescriptorById(
        _aasId: string,
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>> {
        throw new Error('Method not implemented.');
    }
}
