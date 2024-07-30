import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { MsalWrapper } from './msalWrapper';
import type { Metadata } from 'next';
import { EnvProvider } from 'app/env/provider';

export type LocalizedIndexLayoutProps = {
    children: ReactNode;
    params: {
        locale: 'en' | 'de';
    };
};

export const metadata: Metadata = {
    title: 'Mnestix',
    description: 'AAS made easy',
};

export default function RootLayout({ children, params }: Readonly<LocalizedIndexLayoutProps>) {
    return (
        <html lang={params.locale}>
            <body>
                <AppRouterCacheProvider>
                    <EnvProvider>
                        <MsalWrapper>
                            <div id="root">{children}</div>
                        </MsalWrapper>
                    </ EnvProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
