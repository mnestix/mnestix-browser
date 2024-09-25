'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { TemplateClient } from 'lib/api/generated-api/clients.g';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import EmptyDefaultTemplate from 'assets/submodels/defaultEmptySubmodel.json';

export async function createCustomSubmodel(template: Submodel | typeof EmptyDefaultTemplate): Promise<string> {
    const templateApiClient = TemplateClient.create(process.env.MNESTIX_BACKEND_API_URL, mnestixFetch());
    return templateApiClient.createCustomSubmodel(template);
}

export async function updateCustomSubmodel(submodel: Submodel, submodelId: string): Promise<void> {
    const templateApiClientWithAuth = TemplateClient.create(process.env.MNESTIX_BACKEND_API_URL, mnestixFetch());
    return templateApiClientWithAuth.updateCustomSubmodel(submodel, submodelId);
}
