'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ReactNode } from 'react';
import { ClientLayout } from './clientLayout';
import { SessionProvider } from 'next-auth/react';

export type msalWrapperProps = {
    children: ReactNode;
};

export const MsalWrapper = ({ children }: Readonly<msalWrapperProps>) => {

    return (
        <AppRouterCacheProvider>
            <SessionProvider>
                <ClientLayout> {children} </ClientLayout>
            </SessionProvider>
        </AppRouterCacheProvider>
    );
};