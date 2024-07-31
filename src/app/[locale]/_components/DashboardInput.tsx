'use client';
import { Box, Typography, useTheme } from '@mui/material';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { messages } from 'lib/i18n/localization';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ManualAASViewerInput } from '../viewer/_components/ManualAasViewerInput';

export const DashboardInput = () => {
    const isMobile = useIsMobile();
    const theme = useTheme();
    const [inputFocus, setInputFocus] = useState<boolean>(true);
    const logoStyle = {
        color: theme.palette.primary.main,
    };

    const focusInput = () => {
        // The value gets toggled to trigger the useEffect in the child input component 'ManualAASViewerInput'.
        setInputFocus(!inputFocus);
    };

    return (
        <>
            {!isMobile && (
                <Box>
                    <Typography color="text.secondary" textAlign="center">
                        <FormattedMessage {...messages.mnestix.scanAasId} />
                    </Typography>
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: -10,
                            cursor: 'pointer',
                        }}
                        onClick={focusInput}
                    >
                        <ScannerLogo style={logoStyle} alt="Scanner Logo" />
                    </Box>
                    {/* <Typography color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                        <FormattedMessage {...messages.mnestix.orEnterManual} />:
                    </Typography> */}
                </Box>
            )}
            {/* <ManualAASViewerInput focus={inputFocus} /> */}
        </>
    );
};
