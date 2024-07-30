'use client';

import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function AASListHeader({ welcomeText, aasPlatformText }: { welcomeText: string; aasPlatformText: string }) {
    const theme = useTheme();

    return (
        <Typography variant="h2" textAlign="center" marginBottom={2}>
            <span>{welcomeText} </span>
            <span style={{ color: theme.palette.secondary.main }}>{aasPlatformText}</span>
        </Typography>
    );
}
