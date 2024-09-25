'use client';

import React, { PropsWithChildren } from 'react';
import { mnestixFetch } from 'lib/api/infrastructure';
import { useEnv } from 'app/env/provider';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { TemplateShellApi } from 'lib/api/template-shell-api/templateShellApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { SubmodelRegistryServiceApi } from 'lib/api/submodel-registry-service/submodelRegistryServiceApi';

const ApiContext = React.createContext<Apis | null>(null);
export const ApiProvider = (props: PropsWithChildren) => {
    const env = useEnv();
    const apis = {
        templatesClient: new TemplateShellApi(
            env.MNESTIX_BACKEND_API_URL ? env.MNESTIX_BACKEND_API_URL : '',
            env.AUTHENTICATION_FEATURE_FLAG,
            mnestixFetch(),
        ),
        repositoryClient: AssetAdministrationShellRepositoryApi.create({
            basePath: env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        }),
        submodelClient: SubmodelRepositoryApi.create({
            basePath: env.SUBMODEL_REPO_API_URL ?? env.AAS_REPO_API_URL,
            fetch: mnestixFetch(),
        }),
        discoveryServiceClient: DiscoveryServiceApi.create(env.DISCOVERY_API_URL, mnestixFetch()),
        submodelRegistryServiceClient: new SubmodelRegistryServiceApi(env.SUBMODEL_REGISTRY_API_URL, mnestixFetch()),
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
    repositoryClient: AssetAdministrationShellRepositoryApi;
    templatesClient: TemplateShellApi;
    submodelClient: SubmodelRepositoryApi;
    discoveryServiceClient: DiscoveryServiceApi;
    submodelRegistryServiceClient: SubmodelRegistryServiceApi;
};
