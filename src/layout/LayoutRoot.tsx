'use client';
import { Box, styled } from '@mui/material';
import { NotificationOutlet } from 'components/basics/NotificationOutlet';
import { useAuth } from 'lib/hooks/UseAuth';
import { useIsTablet } from 'lib/hooks/UseBreakpoints';
import { Header } from './Header';
import { ReactNode } from 'react';

const StyledBox = styled(Box)(() => ({
    '&.sidebar-visible': {
        marginLeft: 275,
    },
    '&.topbar-visible': {
        // toolbar min-height is 56px
        marginTop: 56,
        '@media(min-width:600px)': {
            // toolbar min-height is 64px
            marginTop: 64,
        },
    },
}));

type Props = {
    children: ReactNode;
};

export function LayoutRoot({ children }: Props) {
    const auth = useAuth();
    const isTablet = useIsTablet();

    return (
        <Box display="flex" height="100%" flexDirection="column">
            <Box display="flex" flex={1} flexDirection="column">
                <StyledBox
                    flex={1}
                    display="flex"
                    className={auth.isLoggedIn && !isTablet ? 'sidebar-visible' : 'topbar-visible'}
                >
                    <Header />
                    {children}
                </StyledBox>
                <NotificationOutlet />
            </Box>
        </Box>
    );
}
