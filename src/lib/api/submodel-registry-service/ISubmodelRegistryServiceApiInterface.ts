import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export interface ISubmodelRegistryServiceApiInterface {
    baseUrl: string;

    getSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    putSubmodelDescriptorById(
        submodelId: string,
        submodelDescriptor: SubmodelDescriptor,
    ): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    deleteSubmodelDescriptorById(submodelId: string): Promise<ApiResponseWrapper<void>>;

    getAllSubmodelDescriptors(): Promise<ApiResponseWrapper<SubmodelDescriptor[]>>;

    postSubmodelDescriptor(submodelDescriptor: SubmodelDescriptor): Promise<ApiResponseWrapper<SubmodelDescriptor>>;

    deleteAllSubmodelDescriptors(): Promise<ApiResponseWrapper<void>>;
}
