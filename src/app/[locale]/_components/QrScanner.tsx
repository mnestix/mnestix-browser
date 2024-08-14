'use client';

import { useState } from 'react';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { Box, useTheme } from '@mui/material';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { QrStream } from 'app/[locale]/_components/QrStream';

export function QrScanner(props: { onScan: (scanResult: string) => Promise<void> }) {
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
        setIsQrActive(true);
        setIsLoading(true);
    };

    const switchToVideoStream = (loadingSuccessful: boolean) => {
        setIsLoading(false);
        if (!loadingSuccessful) setIsQrActive(false);
    };

    const handleScan = async (result: string) => {
        setIsLoading(true);
        try {
            setIsQrActive(false);
            await props.onScan(result);
        } catch {
            setIsQrActive(true);
        }
        setIsLoading(false);
    };

    return (
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
            {isQrActive && (
                <QrStream onScan={handleScan} onLoadingFinished={switchToVideoStream} />
            )}
        </Box>
    );
}
