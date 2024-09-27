import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';

export interface IRegistryServiceApi {
    baseUrl: string;

    getAllAssetAdministrationShellDescriptors(): Promise<JSON>;

    getAssetAdministrationShellDescriptorById(aasId: string): Promise<AssetAdministrationShellDescriptor>;

    postAssetAdministrationShellDescriptor(shellDescriptor: AssetAdministrationShellDescriptor): Promise<JSON>;

    putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<JSON>;

    deleteAssetAdministrationShellDescriptorById(aasId: string): Promise<Response>;
}