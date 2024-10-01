'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';

const submodelRegistryServiceClient = new SubmodelRegistryServiceApi(
    process.env.SUBMODEL_REGISTRY_API_URL,
    mnestixFetch(),
);

export async function getSubmodelDescriptorsById(submodelId: string) {
    return submodelRegistryServiceClient.getSubmodelDescriptorsById(submodelId);
}
