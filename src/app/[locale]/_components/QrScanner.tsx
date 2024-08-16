'use client';

import { useState } from 'react';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { Alert, Box, CircularProgress, IconButton, Snackbar, useTheme } from '@mui/material';
import { QrStream } from 'app/[locale]/_components/QrStream';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';

enum State {
    Stopped,
    LoadScanner,
    ShowVideo,
    HandleQr,
}

export function QrScanner(props: {
    onScan: (scanResult: string) => Promise<void>;
    size?: number | undefined;
    callbackErrorMsg?: string | undefined;
}) {
    // Camera and QR on/off logic

    const [state, setState] = useState<State>(State.Stopped);

    const switchToVideoStream = (loadingSuccessful: boolean) => {
        if (loadingSuccessful) {
            setState(State.ShowVideo);
        } else {
            setIsCameraError(true);
            setState(State.Stopped);
        }
    };

    const handleScan = async (result: string) => {
        setState(State.HandleQr);
        try {
            await props.onScan(result);
            setState(State.Stopped);
        } catch {
            setIsCallbackError(true);
            setState(State.LoadScanner);
        }
    };

    // Snackbar content

    const [isCallbackError, setIsCallbackError] = useState<boolean>(false);
    const [isCameraError, setIsCameraError] = useState<boolean>(false);

    const callbackErrorMsg = props.callbackErrorMsg || 'Could not open the QR code!';

    const handleCallbackErrorSnackbarClose = () => {
        setIsCallbackError(false);
    };

    const handleCameraErrorSnackbarClose = () => {
        setIsCameraError(false);
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
                    position: 'relative',
                }}
            >
                {state === State.Stopped && (
                    <Box onClick={() => setState(State.LoadScanner)} padding="50px">
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
                    <Box padding="50px" justifyContent="center">
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
            <Snackbar open={isCallbackError} autoHideDuration={4000} onClose={handleCallbackErrorSnackbarClose}>
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                    onClose={handleCallbackErrorSnackbarClose}
                >
                    {callbackErrorMsg}
                </Alert>
            </Snackbar>
            <Snackbar open={isCameraError} autoHideDuration={4000} onClose={handleCameraErrorSnackbarClose}>
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                    onClose={handleCameraErrorSnackbarClose}
                >
                    Could not open the QR scanner!
                </Alert>
            </Snackbar>
        </>
    );
}
