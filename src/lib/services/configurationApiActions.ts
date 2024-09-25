'use server';

import { ConfigurationShellApi } from 'lib/api/configuration-shell-api/configurationShellApi';
import { mnestixFetch } from 'lib/api/infrastructure';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export async function getIdGenerationSettings(): Promise<Submodel> {
    const configurationShellApi = ConfigurationShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL,
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return configurationShellApi.getIdGenerationSettings();
}

export async function putSingleIdGenerationSetting(
    idShort: string,
    bearerToken: string,
    values: {
        prefix: string;
        dynamicPart: string;
    },
): Promise<void> {
    const configurationShellApi = ConfigurationShellApi.create(
        process.env.MNESTIX_BACKEND_API_URL,
        process.env.AUTHENTICATION_FEATURE_FLAG?.toLowerCase().trim() === 'true' ?? false,
        mnestixFetch(),
    );
    return configurationShellApi.putSingleIdGenerationSetting(idShort, bearerToken, values);
}
