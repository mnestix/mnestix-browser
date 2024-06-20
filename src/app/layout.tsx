import React from 'react';
import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { EnvProvider } from './env/provider';

export const metadata: Metadata = {
    title: 'Mnestix',
    description: 'AAS made easy',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AppRouterCacheProvider>
                    <EnvProvider>
                        <div id="root">{children}</div>
                    </EnvProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
