import { alpha, Box, BoxProps, styled } from '@mui/material';

const Circle = styled(Box)(({ theme }) => ({
    display: 'inline-block',
    '.inner-circle': {
        display: 'flex',
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: '50%',
        padding: '5px',
    },
}));

export function IconCircleWrapper(props: BoxProps) {
    return (
        <Circle {...props}>
            <Box className="inner-circle">{props.children}</Box>
        </Circle>
    );
}
