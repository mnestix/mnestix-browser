'use client';
import { PropsWithChildren, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { theme as defaultTheme } from './theme';
import { deDE } from '@mui/material/locale';
import { CssBaseline, Theme, ThemeOptions } from '@mui/material';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useEnv } from 'app/env/provider';
import { DefaultThemeSettings } from 'layout/theme/DefaultTheme';

export function CustomThemeProvider(props: PropsWithChildren<{ readonly skipStyleReset?: boolean }>) {
    const [muiTheme, setMuiTheme] = useState<Theme>(createTheme(defaultTheme, deDE));
    const env = useEnv();

    useAsyncEffect(async () => {
        const theme: ThemeOptions = { ...defaultTheme };
        if (!theme.palette) return;

        // Set up dark theme with black background and white text
        theme.palette.mode = 'dark';
        theme.palette.background = {
            default: '#22252E',
            paper: '#33353D',
        };
        theme.palette.text = {
            primary: '#FFFFFF',
            secondary: '#b3b3b3',
        };

        theme.palette.primary = { main: env.THEME_PRIMARY_COLOR ?? DefaultThemeSettings.primaryColor };
        theme.palette.secondary = { main: env.THEME_SECONDARY_COLOR ?? DefaultThemeSettings.secondaryColor };
        if (env.THEME_LOGO_URL !== undefined) {
            theme.productLogo = { logo: env.THEME_LOGO_URL };
        } else {
            theme.productLogo = { logo: env.THEME_BASE64_LOGO ?? DefaultThemeSettings.base64Logo };
        }
        setMuiTheme(createTheme(theme, deDE));
    }, [env]);

    return (
        <>
            <ThemeProvider theme={muiTheme}>
                {!props.skipStyleReset && <CssBaseline />}
                {props.children}
            </ThemeProvider>
        </>
    );
}
