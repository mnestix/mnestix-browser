import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

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

    getAllAssetAdministrationShellDescriptors(): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAssetAdministrationShellDescriptorById(aasId: string): Promise<AssetAdministrationShellDescriptor> {
        if (!this.registryShellDescriptorEntries) return Promise.reject(new Error('no registry configuration'));
        let shellDescriptor: AssetAdministrationShellDescriptor;
        for (shellDescriptor of this.registryShellDescriptorEntries) {
            if (shellDescriptor.id === aasId) return Promise.resolve(shellDescriptor);
        }
        return Promise.reject(new Error('no shell descriptor for aasId:' + aasId));
    }

    async getAssetAdministrationShellFromEndpoint(endpoint: URL): Promise<AssetAdministrationShell> {
        if (!this.shellsAvailableOnEndpoints) return Promise.reject(new Error('no registry configuration'));
        let registryEndpoint: INullableAasRegistryEndpointEntries;
        for (registryEndpoint of this.shellsAvailableOnEndpoints) {
            if (registryEndpoint.endpoint.toString() === endpoint.toString())
                return Promise.resolve(registryEndpoint.aas);
        }
        return Promise.reject(new Error('no shell descriptor for url:' + endpoint));
    }

    postAssetAdministrationShellDescriptor(_shellDescriptor: AssetAdministrationShellDescriptor): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    putAssetAdministrationShellDescriptorById(
        _aasId: string,
        _shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    deleteAssetAdministrationShellDescriptorById(_aasId: string): Promise<Response> {
        throw new Error('Method not implemented.');
    }
}
