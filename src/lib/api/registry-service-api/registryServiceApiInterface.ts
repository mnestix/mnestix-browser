import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

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

    getAssetAdministrationShellFromEndpoint(endpoint: URL): Promise<AssetAdministrationShell>;
}
