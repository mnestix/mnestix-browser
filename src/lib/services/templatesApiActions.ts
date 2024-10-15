'use server';

import { mnestixFetchLegacy } from 'lib/api/infrastructure';
import { TemplateShellApi } from 'lib/api/template-shell-api/templateShellApi';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

const templateApiClient = TemplateShellApi.create(
    process.env.MNESTIX_BACKEND_API_URL ? process.env.MNESTIX_BACKEND_API_URL : '',
    process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
    mnestixFetchLegacy(),
);

export async function getDefaultTemplates(bearerToken: string): Promise<Submodel[]> {
    return templateApiClient.getDefaults(bearerToken);
}

export async function getCustomTemplates(bearerToken: string): Promise<Submodel[]> {
    return templateApiClient.getCustoms(bearerToken);
}

export async function getCustomTemplateById(bearerToken: string, id: string): Promise<Submodel> {
    return templateApiClient.getCustom(bearerToken, id);
}

export async function deleteCustomTemplateById(bearerToken: string, id: string): Promise<string | number> {
    return templateApiClient.deleteCustomById(bearerToken, id);
}
