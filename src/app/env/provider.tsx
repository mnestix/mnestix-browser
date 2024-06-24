'use client';
import React, { createContext, useContext, useState } from 'react';
import { EnvironmentalVariables, getEnv } from './env';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';

const initialValues: EnvironmentalVariables = {
    AAS_LIST_FEATURE_FLAG: false,
    COMPARISON_FEATURE_FLAG: false,
    AUTHENTICATION_FEATURE_FLAG: false,
    LOCK_TIMESERIES_PERIOD_FEATURE_FLAG: false,
    AD_CLIENT_ID: '',
    AD_TENANT_ID: '',
    APPLICATION_ID_URI: '',
    DISCOVERY_API_URL: '',
    REGISTRY_API_URL: '',
    AAS_REPO_API_URL: '',
    MNESTIX_BACKEND_API_URL: '',
    THEME_PRIMARY_COLOR: undefined,
    THEME_SECONDARY_COLOR: undefined,
    THEME_BASE64_LOGO: undefined,
    THEME_LOGO_URL: undefined,
};

export const EnvContext = createContext(initialValues);

export const EnvProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const [env, setEnv] = useState<EnvironmentalVariables>(initialValues);

    useAsyncEffect(async () => {
        const env = await getEnv();
        setEnv(env);
    }, []);
    return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};

export const useEnv = () => {
    return useContext(EnvContext);
};
