import { Box, BoxProps, CircularProgress } from '@mui/material';

export function CenteredLoadingSpinner(props: BoxProps) {
    return (
        <Box display="flex" justifyContent="center" {...props}>
            <CircularProgress />
        </Box>
    );
}
