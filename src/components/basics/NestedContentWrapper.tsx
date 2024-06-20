import { Box, BoxProps, styled } from '@mui/material';

const StyledWrapper = styled(Box)(({ theme }) => ({
    borderLeft: `3px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    paddingRight: 0,
}));

export function NestedContentWrapper(props: BoxProps) {
    return <StyledWrapper {...props} />;
}
