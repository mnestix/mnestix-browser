'use client';

import { useState } from 'react';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { Box, CircularProgress, IconButton, useTheme } from '@mui/material';
import { QrStream } from 'app/[locale]/_components/QrStream';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import { LocalizedError } from 'lib/util/LocalizedError';

enum State {
    Stopped,
    LoadScanner,
    ShowVideo,
    HandleQr,
}

export function QrScanner(props: { onScan: (scanResult: string) => Promise<void>; size?: number | undefined }) {
    // Camera and QR on/off logic

    const [state, setState] = useState<State>(State.Stopped);

    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();

    const theme = useTheme();
    const size = props.size || 250;

    const switchToVideoStream = (loadingSuccessful: boolean) => {
        if (loadingSuccessful) {
            setState(State.ShowVideo);
        } else {
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.qrScanner.errorOnQrScannerOpen),
                severity: 'error',
            });
            setState(State.Stopped);
        }
    };

    const handleScan = async (result: string) => {
        setState(State.HandleQr);
        try {
            await props.onScan(result);
            setState(State.Stopped);
        } catch (e) {
            const msg = e instanceof LocalizedError ? e.descriptor : messages.mnestix.qrScanner.defaultCallbackErrorMsg;
            notificationSpawner.spawn({
                message: intl.formatMessage(msg),
                severity: 'error',
            });
            setState(State.LoadScanner);
        }
    };

    return (
        <>
            <Box position="relative" margin="auto" height={size} width={size} style={{ cursor: 'pointer' }}>
                {state === State.Stopped && (
                    <Box
                        onClick={() => setState(State.LoadScanner)}
                        padding="50px"
                        position="absolute"
                        height={size}
                        width={size}
                    >
                        <ScannerLogo style={{ color: theme.palette.primary.main }} alt="Scanner Logo" />
                    </Box>
                )}
                {state === State.ShowVideo && (
                    <IconButton
                        aria-label="close scanner"
                        onClick={() => setState(State.Stopped)}
                        style={{
                            position: 'absolute',
                            zIndex: 999,
                            right: 0,
                        }} // Align to the right and render in front of everything
                    >
                        <HighlightOffRoundedIcon fontSize="large" />
                    </IconButton>
                )}
                {(state === State.LoadScanner || state === State.HandleQr) && (
                    <Box padding="50px" position="absolute" height={size} width={size}>
                        <CircularProgress
                            style={{ margin: 'auto', position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                        />
                        <ScannerLogo style={{ color: theme.palette.primary.main, opacity: 0.4 }} alt="Scanner Logo" />
                    </Box>
                )}
                {(state === State.LoadScanner || state === State.ShowVideo) && (
                    <QrStream onScan={handleScan} onLoadingFinished={switchToVideoStream} />
                )}
            </Box>
        </>
    );
}
