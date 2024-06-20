// Layout needs to be client-side because of the msal provider
'use client';

import { Box } from '@mui/material';
import { ApiProvider } from 'components/azureAuthentication/ApiProvider';
import { CurrentAasContextProvider } from 'components/contexts/CurrentAasContext';
import { NotificationContextProvider } from 'components/contexts/NotificationContext';
import { LayoutRoot } from 'layout/LayoutRoot';
import { CustomThemeProvider } from 'layout/theme/CustomThemeProvider';
import { Internationalization } from 'lib/i18n/Internationalization';
import { ReactNode } from 'react';

export type ClientLayoutProps = {
    children: ReactNode;
};

export const ClientLayout = ({ children }: Readonly<ClientLayoutProps>) => {
    return (
        <ApiProvider>
            <Internationalization>
                <CustomThemeProvider>
                    <CurrentAasContextProvider>
                        <NotificationContextProvider>
                            <LayoutRoot>
                                <Box flexGrow={1} id="root">
                                    {children}
                                </Box>
                            </LayoutRoot>
                        </NotificationContextProvider>
                    </CurrentAasContextProvider>
                </CustomThemeProvider>
            </Internationalization>
        </ApiProvider>
    );
};
