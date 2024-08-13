import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import type { Metadata } from 'next';
import { ClientLayout } from 'app/[locale]/clientLayout';

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
                    <ClientLayout>
                        <div id="root">{children}</div>
                    </ClientLayout>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
