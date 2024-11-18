'use client';
import { Box, styled } from '@mui/material';
import { NotificationOutlet } from 'components/basics/NotificationOutlet';
import { Header } from './Header';
import { ReactNode } from 'react';

const StyledBox = styled(Box)(() => ({
        // toolbar min-height is 56px
        marginTop: 56,
        '@media(min-width:600px)': {
            // toolbar min-height is 64px
            marginTop: 64,
        },
}));

type Props = {
    children: ReactNode;
};

export function LayoutRoot({ children }: Props) {

    return (
        <Box display="flex" height="100%" flexDirection="column">
            <Box display="flex" flex={1} flexDirection="column">
                <StyledBox
                    flex={1}
                    display="flex"
                >
                    <Header />
                    {children}
                </StyledBox>
                <NotificationOutlet />
            </Box>
        </Box>
    );
}
