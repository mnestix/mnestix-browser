﻿'use client';

import React, { PropsWithChildren } from 'react';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AasListClient, TemplateClient } from 'lib/api/generated-api/clients.g';
import { useEnv } from 'app/env/provider';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { ConfigurationShellApi } from 'lib/api/configuration-shell-api/configurationShellApi';
import { TemplateShellApi } from 'lib/api/template-shell-api/templateShellApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';

const ApiContext = React.createContext<Apis | null>(null);
export const ApiProvider = (props: PropsWithChildren) => {
    const env = useEnv();
    const apis = {
        templateClientWithAuth: new TemplateClient(
            env.MNESTIX_BACKEND_API_URL,
            mnestixFetch(),
        ),
        aasListClient: new AasListClient(
            env.MNESTIX_BACKEND_API_URL,
            mnestixFetch(),
        ),
        configurationClient: new ConfigurationShellApi(
            env.MNESTIX_BACKEND_API_URL, 
            env.AUTHENTICATION_FEATURE_FLAG,
            mnestixFetch()),
        repositoryClient: new AssetAdministrationShellRepositoryApi({ basePath: env.AAS_REPO_API_URL, fetch: mnestixFetch() }),
        templatesClient: new TemplateShellApi(
            env.MNESTIX_BACKEND_API_URL ? env.MNESTIX_BACKEND_API_URL : '',
            env.AUTHENTICATION_FEATURE_FLAG,
        ),
        submodelClient: new SubmodelRepositoryApi({ basePath: env.SUBMODEL_REPO_API_URL, fetch: mnestixFetch() }),
        discoveryServiceClient: new DiscoveryServiceApi(env.DISCOVERY_API_URL),
        registryServiceClient: new RegistryServiceApi(env.REGISTRY_API_URL),
        submodelRegistryServiceClient: new SubmodelRegistryServiceApi(env.SUBMODEL_REGISTRY_API_URL),
    };

    return <ApiContext.Provider value={apis}>{props.children}</ApiContext.Provider>;
};

export function useApis(): Apis {
    const context = React.useContext(ApiContext);
    if (context === null) {
        throw new Error('useApis must be used within a ApiProvider');
    }
    return context;
}

export type Apis = {
    templateClientWithAuth: TemplateClient;
    aasListClient: AasListClient;
    configurationClient: ConfigurationShellApi;
    repositoryClient: AssetAdministrationShellRepositoryApi;
    templatesClient: TemplateShellApi;
    submodelClient: SubmodelRepositoryApi;
    discoveryServiceClient: DiscoveryServiceApi;
    registryServiceClient: RegistryServiceApi;
    submodelRegistryServiceClient: SubmodelRegistryServiceApi;
};
