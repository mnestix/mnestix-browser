'use client';

import { useState } from 'react';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { Box, CircularProgress, IconButton, useTheme } from '@mui/material';
import { QrStream } from 'app/[locale]/_components/QrStream';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { MessageDescriptorWithId, messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';

enum State {
    Stopped,
    LoadScanner,
    ShowVideo,
    HandleQr,
}

type ScanErrorMsg = MessageDescriptorWithId | (() => MessageDescriptorWithId);

function generateErrorCallback(errorMsg?: ScanErrorMsg) {
    if (typeof errorMsg === 'function') {
        return errorMsg;
    } else {
        const msg = errorMsg || messages.mnestix.qrScanner.defaultCallbackErrorMsg;
        return () => msg;
    }
}

export function QrScanner(props: {
    onScan: (scanResult: string) => Promise<void>;
    size?: number | undefined;
    scanErrorMsg?: ScanErrorMsg;
}) {
    // Camera and QR on/off logic

    const [state, setState] = useState<State>(State.Stopped);

    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const callbackErrorMsg = generateErrorCallback(props.scanErrorMsg);

    const switchToVideoStream = (loadingSuccessful: boolean) => {
        if (loadingSuccessful) {
            setState(State.ShowVideo);
        } else {
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.qrScanner.errorOnQrScannerOpen),
                severity: 'error'
            });
            setState(State.Stopped);
        }
    };

    const handleScan = async (result: string) => {
        setState(State.HandleQr);
        try {
            await props.onScan(result);
            setState(State.Stopped);
        } catch {
            notificationSpawner.spawn({
                message: intl.formatMessage(callbackErrorMsg()),
                severity: 'error'
            });
            setState(State.LoadScanner);
        }
    };

    // Scanner logo

    const theme = useTheme();
    const size = props.size || 250;

    return (
        <>
            <Box
                style={{
                    cursor: 'pointer',
                    height: size,
                    width: size,
                    margin: 'auto',
                    position: 'relative'
                }}
            >
                {state === State.Stopped && (
                    <Box
                        onClick={() => setState(State.LoadScanner)}
                        padding="50px"
                        justifyContent="center"
                        position="absolute"
                        style={{ height: size, width: size }}
                    >
                        <ScannerLogo style={{ color: theme.palette.primary.main }} alt="Scanner Logo" />
                    </Box>
                )}
                {state !== State.Stopped && (
                    <IconButton
                        aria-label="delete"
                        size="large"
                        onClick={() => setState(State.Stopped)}
                        style={{ position: 'absolute', zIndex: 999, right: 0 }}
                    >
                        <HighlightOffRoundedIcon fontSize="inherit" />
                    </IconButton>
                )}
                {(state === State.LoadScanner || state === State.HandleQr) && (
                    <Box
                        padding="50px"
                        justifyContent="center"
                        position="absolute"
                        style={{ height: size, width: size }}
                    >
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
