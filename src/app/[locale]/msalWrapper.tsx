// Layout needs to be client-side because of the msal provider
'use client';

import { PublicClientApplication } from '@azure/msal-browser';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createMsalConfig } from 'authConfig';
import { ReactNode, useEffect, useState } from 'react';
import { ClientLayout } from './clientLayout';
import { SessionProvider } from "next-auth/react"

export type msalWrapperProps = {
    children: ReactNode;
    adClientId: string;
    adTenantId: string;
};

export const MsalWrapper = ({ children, adClientId, adTenantId }: Readonly<msalWrapperProps>) => {
    const [msalInstance, setMsalInstance] = useState<PublicClientApplication>();

    return (
        <AppRouterCacheProvider>
            <SessionProvider>
                <ClientLayout> {children} </ClientLayout>
            </SessionProvider>
        </AppRouterCacheProvider>
    );
};
