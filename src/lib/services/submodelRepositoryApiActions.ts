'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

const submodelClient: SubmodelRepositoryApi = SubmodelRepositoryApi.create({
    basePath: process.env.SUBMODEL_REPO_API_URL ?? process.env.AAS_REPO_API_URL,
    fetch: mnestixFetch(),
});

export async function getSubmodelById(id: string): Promise<Submodel> {
    return submodelClient.getSubmodelById(id);
}

export async function getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string): Promise<Blob> {
    return submodelClient.getAttachmentFromSubmodelElement(submodelId, submodelElementPath);
}
