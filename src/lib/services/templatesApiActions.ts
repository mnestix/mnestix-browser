'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { TemplateShellApi } from 'lib/api/template-shell-api/templateShellApi';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

export async function getDefaults(bearerToken: string): Promise<Submodel[]> {
    const templateApiClient = TemplateShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL ? process.env.MNESTIX_BACKEND_API_URL : '',
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return templateApiClient.getDefaults(bearerToken);
}

export async function getCustoms(bearerToken: string): Promise<Submodel[]> {
    const templateApiClient = TemplateShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL ? process.env.MNESTIX_BACKEND_API_URL : '',
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return templateApiClient.getCustoms(bearerToken);
}

export async function getCustom(bearerToken: string, id: string): Promise<Submodel> {
    const templateApiClient = TemplateShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL ? process.env.MNESTIX_BACKEND_API_URL : '',
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return templateApiClient.getCustom(bearerToken, id);
}

export async function deleteCustomById(bearerToken: string, id: string): Promise<string | number> {
    const templateApiClient = TemplateShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL ? process.env.MNESTIX_BACKEND_API_URL : '',
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return templateApiClient.deleteCustomById(bearerToken, id);
}
