import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';

export interface ISubmodelRegistryServiceApiInterface {
    baseUrl: string;
    http: { fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response> };

    getSubmodelDescriptorById(submodelId: string): Promise<SubmodelDescriptor>;

    putSubmodelDescriptorById(
        submodelId: string,
        submodelDescriptor: SubmodelDescriptor,
    ): Promise<SubmodelDescriptor | void>;

    deleteSubmodelDescriptorById(submodelId: string): Promise<void>;

    getAllSubmodelDescriptors(): Promise<SubmodelDescriptor[]>;

    postSubmodelDescriptor(submodelDescriptor: SubmodelDescriptor): Promise<SubmodelDescriptor>;

    deleteAllSubmodelDescriptors(): Promise<void>;
}
