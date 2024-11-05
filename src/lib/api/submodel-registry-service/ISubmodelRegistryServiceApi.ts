import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export interface ISubmodelRegistryServiceApi {
    /**
     * Return the basePath of this registry service endpoint.
     */
    getBasePath(): string;

    getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    putSubmodelDescriptorById(
        submodelId: string,
        submodelDescriptor: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    deleteSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<void>>;

    getAllSubmodelDescriptors(): Promise<ApiResponseWrapper<SubmodelDescriptor[]>>;

    postSubmodelDescriptor(submodelDescriptor: SubmodelDescriptor): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    deleteAllSubmodelDescriptors(): Promise<ApiResponseWrapper<void>>;

    getSubmodelFromEndpoint(endpoint: string): Promise<ApiResponseWrapper<Submodel>>;
}
