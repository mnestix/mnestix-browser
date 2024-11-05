import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export interface IRegistryServiceApi {
    /**
     * Returns the base URL of this AAS registry endpoint.
     */
    getBaseUrl(): string;

    getAssetAdministrationShellDescriptorById(
        aasId: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>>;

    putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<AssetAdministrationShellDescriptor>>;

    getAssetAdministrationShellFromEndpoint(endpoint: URL): Promise<ApiResponseWrapper<AssetAdministrationShell>>;

    postAssetAdministrationShellDescriptor(
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<ApiResponseWrapper<void>>;
}
