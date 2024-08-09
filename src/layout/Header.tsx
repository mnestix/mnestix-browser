import { AppBar, Box, styled, Toolbar } from '@mui/material';
import MainMenu from './menu/MainMenu';
import { useAuth } from 'lib/hooks/UseAuth';
import { useIsTablet } from 'lib/hooks/UseBreakpoints';
import { HeaderLogo } from './HeaderLogo';

const Offset = styled(Box)(({ theme }) => theme.mixins.toolbar);

const StyledLogoWrapper = styled(Box)(() => ({
    '.logo': {
        // toolbar min-height is 56px
        height: 32,
        margin: 10,
        '@media(min-width:600px)': {
            // toolbar min-height is 64px
            height: 36,
        },
    },
}));

const StyledToolbar = styled(Toolbar)(() => ({
    '&.hidden': {
        minHeight: 0,
        height: 0,
        overflow: 'hidden',
    },
}));

export function Header() {
    const auth = useAuth();
    const isTablet = useIsTablet();

    return (
        <>
            <AppBar position="fixed">
                <StyledToolbar disableGutters className={auth.isLoggedIn && !isTablet ? 'hidden' : ''}>
                    <MainMenu />
                    <StyledLogoWrapper
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                        marginRight="18%"
                        position="absolute"
                        alignSelf="center"
                    >
                        <Box className="logo">
                            <HeaderLogo />
                        </Box>
                    </StyledLogoWrapper>
                </StyledToolbar>
            </AppBar>
            <Offset />
        </>
    );
}
