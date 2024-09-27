'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { TemplateClient } from 'lib/api/generated-api/clients.g';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import EmptyDefaultTemplate from 'assets/submodels/defaultEmptySubmodel.json';

const templateApiClientWithAuth = TemplateClient.create(process.env.MNESTIX_BACKEND_API_URL, mnestixFetch());

export async function createCustomSubmodelTemplate(template: Submodel | typeof EmptyDefaultTemplate): Promise<string> {
    return templateApiClientWithAuth.createCustomSubmodel(template);
}

export async function updateCustomSubmodelTemplate(submodel: Submodel, submodelId: string): Promise<void> {
    return templateApiClientWithAuth.updateCustomSubmodel(submodel, submodelId);
}
