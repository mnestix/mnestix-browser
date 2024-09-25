'use client';

import ScannerLogo from 'assets/ScannerLogo.svg';
import { Box, CircularProgress, IconButton, useTheme } from '@mui/material';
import { QrStream } from 'app/[locale]/_components/qrScanner/QrStream';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import { LocalizedError } from 'lib/util/LocalizedError';
import { keyframes, styled } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import CircleIcon from '@mui/icons-material/Circle';
import { QrScannerStateMachine } from 'app/[locale]/_components/qrScanner/QrScannerStateMachine';

export function QrScanner(props: { onScan: (scanResult: string) => Promise<void>; size?: number | undefined }) {
    const state = new QrScannerStateMachine(
        props.onScan,
        (error) => {
            const msg =
                error instanceof LocalizedError ? error.descriptor : messages.mnestix.qrScanner.defaultCallbackErrorMsg;
            notificationSpawner.spawn({
                message: intl.formatMessage(msg),
                severity: 'error',
            });
        },
        () =>
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.qrScanner.errorOnQrScannerOpen),
                severity: 'error',
            }),
    );

    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();

    const theme = useTheme();
    const size = props.size || 250;

    const expandFromCenter = keyframes`
        0% {
            width: 0;
            left: 50%;
        }
        100% {
            width: 100%;
            left: 0;
        }
    `;

    interface VideoContainerProps {
        theme: typeof theme;
        focused: boolean;
    }

    const VideoContainer = styled(Box)<VideoContainerProps>(({ theme, focused }) => ({
        position: 'relative',
        display: 'inline-block',
        outline: 'none',
        '& video': {
            display: 'block',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            width: size,
            height: size,
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 4,
            backgroundColor: theme.palette.primary.main,
            transition: 'background-color 0.3s ease-in-out',
            animation: focused ? `${expandFromCenter} 0.25s forwards` : 'none',
        },
    }));

    // This will allow cypress to call the callback manually and circumvent a webcam mock
    if (typeof window !== 'undefined' && typeof window.Cypress !== 'undefined') {
        window.Cypress.scannerCallback = state.handleScan;
    }

    return (
        <Box position="relative" margin="auto" height={size} width={size} style={{ cursor: 'pointer' }}>
            {state.IsStopped && (
                <Box
                    onClick={() => state.startScanner()}
                    padding="50px"
                    position="absolute"
                    height={size}
                    width={size}
                    data-testid="scanner-start"
                >
                    <ScannerLogo style={{ color: theme.palette.primary.main }} alt="Scanner Logo" />
                </Box>
            )}
            {state.IsVideoShown && (
                <IconButton
                    data-testid="scanner-close-button"
                    aria-label="close scanner"
                    onClick={() => state.stopScanner()}
                    style={{
                        position: 'absolute',
                        zIndex: 995,
                        right: 0,
                    }} // Align to the right top corner and render in front of everything
                >
                    <CircleIcon fontSize="medium" style={{ color: 'white', position: 'absolute', zIndex: 993 }} />
                    <CancelIcon fontSize="large" color="primary" style={{ zIndex: 994 }} />
                </IconButton>
            )}
            {state.IsLoading && (
                <Box padding="50px" position="absolute" height={size} width={size}>
                    <CircularProgress
                        style={{ margin: 'auto', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                    />
                    <ScannerLogo style={{ color: theme.palette.primary.main, opacity: 0.4 }} alt="Scanner Logo" />
                </Box>
            )}
            {state.IsActive && (
                <ThemeProvider theme={theme}>
                    <VideoContainer theme={theme} focused={state.IsVideoShown} tabIndex={0}>
                        <QrStream onScan={state.handleScan} onLoadingFinished={state.switchToVideoStream} />
                    </VideoContainer>
                </ThemeProvider>
            )}
        </Box>
    );
}
