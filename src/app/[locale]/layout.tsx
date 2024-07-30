import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { MsalWrapper } from './msalWrapper';

export type LocalizedIndexLayoutProps = {
    children: ReactNode;
    params: {
        locale: 'en' | 'de';
    };
};

export default function LocaleLayout({ children, params }: Readonly<LocalizedIndexLayoutProps>) {
    return (
        <html lang={params.locale}>
            <body>
                <AppRouterCacheProvider>
                    <MsalWrapper>
                        {children}
                    </MsalWrapper>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
