'use client';

import { useState } from 'react';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { Alert, Box, useTheme } from '@mui/material';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { QrStream } from 'app/[locale]/_components/QrStream';
import { Snackbar } from '@mui/material';

export function QrScanner(props: {
    onScan: (scanResult: string) => Promise<void>;
    callbackErrorMsg?: string | undefined;
}) {
    // Camera and QR on/off logic

    const [isQrActive, setIsQrActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // const stopQrScanner = () => {
    //     scanner?.current?.stop();
    //     setIsLoading(false);
    //     setIsQrActive(false);
    // };

    const startQrScanner = async () => {
        setIsQrActive(true);
        setIsLoading(true);
    };

    const switchToVideoStream = (loadingSuccessful: boolean) => {
        setIsLoading(false);
        if (!loadingSuccessful) {
            setIsQrActive(false);
            setIsCameraError(true);
        }
    };

    const handleScan = async (result: string) => {
        setIsLoading(true);
        try {
            setIsQrActive(false);
            await props.onScan(result);
        } catch {
            setIsCallbackError(true);
            setIsQrActive(true);
        }
        setIsLoading(false);
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
    const logoStyle = {
        color: theme.palette.primary.main,
    };

    return (
        <>
            <Box
                style={{
                    cursor: 'pointer',
                    height: 250,
                    width: 250,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                {!isQrActive && !isLoading && (
                    <Box onClick={startQrScanner}>
                        <ScannerLogo style={logoStyle} alt="Scanner Logo" />
                    </Box>
                )}
                {isLoading && <CenteredLoadingSpinner />}
                {isQrActive && <QrStream onScan={handleScan} onLoadingFinished={switchToVideoStream} />}
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
