'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

const submodelRegistryServiceClient = SubmodelRegistryServiceApi.create(
    process.env.SUBMODEL_REGISTRY_API_URL,
    mnestixFetch(),
);

export async function getSubmodelDescriptorsById(submodelId: string): Promise<ApiResponseWrapper<SubmodelDescriptor>> {
    return submodelRegistryServiceClient.getSubmodelDescriptorById(submodelId);
}
