'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

const submodelRegistryServiceClient = new SubmodelRegistryServiceApi(
    mnestixFetch(),
    process.env.SUBMODEL_REGISTRY_API_URL,
);

export async function getSubmodelDescriptorsById(submodelId: string) : Promise<ApiResponseWrapper<SubmodelDescriptor>> {
    return (await submodelRegistryServiceClient.getSubmodelDescriptorsById(submodelId)).toJSON();
}
