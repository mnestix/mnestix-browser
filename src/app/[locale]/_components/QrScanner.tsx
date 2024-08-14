'use client';

import { useRef, useState } from 'react';
import Scanner from 'qr-scanner';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { Box, useTheme } from '@mui/material';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';

export function QrScanner(props: { callback: (scanResult: string) => Promise<void> }) {
    // QR States
    const videoEl = useRef<HTMLVideoElement>(null);
    const scanner = useRef<Scanner>();
    const [isQrActive, setIsQrActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const theme = useTheme();
    const logoStyle = {
        color: theme.palette.primary.main,
    };

    // const stopQrScanner = () => {
    //     scanner?.current?.stop();
    //     setIsLoading(false);
    //     setIsQrActive(false);
    // };

    const startQrScanner = async () => {
        setIsLoading(true);
        try {
            await scanner?.current?.start();
            setIsQrActive(true);
        } catch (e) {
            // TODO Error on snackbar, cannot start qr scanner
            setIsQrActive(false);
        }
        setIsLoading(false);
    };

    const onScanSuccess = async (result: Scanner.ScanResult) => {
        setIsLoading(true);
        scanner?.current?.stop();

        if (result?.data) {
            await props.callback(result.data);
            setIsQrActive(false);
        } else {
            scanner?.current?.start();
            setIsQrActive(true);
            // TODO snackbar error QR Scan ERROR
        }

        setIsLoading(false);
    };

    const onScanFail = (err: string | Error) => {
        console.log(err);
        // TODO snackbar error: QR Scan error : {e}
    };

    useAsyncEffect(async () => {
        if (videoEl?.current && !scanner.current) {
            scanner.current = new Scanner(videoEl?.current, onScanSuccess, {
                onDecodeError: onScanFail,
                preferredCamera: 'environment',
                highlightScanRegion: true,
                highlightCodeOutline: true,
                // overlay: qrBoxEl?.current || undefined,
            });
        }

        return () => {
            if (!videoEl?.current) {
                scanner?.current?.stop();
            }
        };
    }, []);

    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: -10,
                cursor: 'pointer',
            }}
        >
            {!isQrActive && !isLoading && (
                <Box onClick={startQrScanner}>
                    <ScannerLogo style={logoStyle} alt="Scanner Logo" />
                </Box>
            )}
            {isLoading && <CenteredLoadingSpinner />}
            <video ref={videoEl} hidden={!isQrActive || isLoading} style={{ opacity: 1, width: '235', height: '235' }}></video>
        </Box>
    );
}
