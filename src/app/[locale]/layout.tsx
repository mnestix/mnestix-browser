import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import type { Metadata } from 'next';
import { ClientLayout } from 'app/[locale]/clientLayout';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

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

export default async function RootLayout({ children, params }: Readonly<LocalizedIndexLayoutProps>) {
    const messages = await getMessages();

    return (
        <html lang={params.locale}>
            <body>
                <AppRouterCacheProvider>
                    <NextIntlClientProvider messages={messages}>
                        <ClientLayout>
                            <div id="root">{children}</div>
                        </ClientLayout>
                    </NextIntlClientProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
