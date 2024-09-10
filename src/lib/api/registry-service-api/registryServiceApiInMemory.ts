import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';

export class RegistryServiceApiInMemory implements IRegistryServiceApi {
    private registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
    baseUrl: string;
    _baseUrl: string;

    constructor(options: { registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null }) {
        this.registryShellDescriptorEntries = options.registryShellDescriptorEntries;
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

    postAssetAdministrationShellDescriptor(shellDescriptor: AssetAdministrationShellDescriptor): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor
    ): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    deleteAssetAdministrationShellDescriptorById(aasId: string): Promise<Response> {
        throw new Error('Method not implemented.');
    }
}