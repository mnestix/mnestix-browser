// Layout needs to be client-side because of the msal provider
'use client';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createMsalConfig } from 'authConfig';
import { ReactNode, useEffect, useState } from 'react';
import { ClientLayout } from './clientLayout';

export type msalWrapperProps = {
    children: ReactNode;
    adClientId: string;
    adTenantId: string;
};

export const MsalWrapper = ({ children, adClientId, adTenantId }: Readonly<msalWrapperProps>) => {
    const [msalInstance, setMsalInstance] = useState<PublicClientApplication>();

    useEffect(() => {
        const msalConfig = createMsalConfig(
            adClientId,
            `https://login.microsoftonline.com/${adTenantId}`,
            window.location.origin,
        );

        setMsalInstance(new PublicClientApplication(msalConfig));
    }, []);

    return (
        <AppRouterCacheProvider>
            {msalInstance && (
                <MsalProvider instance={msalInstance}>
                    <ClientLayout> {children} </ClientLayout>
                </MsalProvider>
            )}
        </AppRouterCacheProvider>
    );
};
