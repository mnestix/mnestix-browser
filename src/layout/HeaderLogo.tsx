import { Box, useTheme } from '@mui/material';
import { XitasoLogo } from 'components/basics/XitasoLogo';
import { useRouter } from 'next/navigation';

export function HeaderLogo() {
    const theme = useTheme();
    const navigate = useRouter();

    const goToHome = () => {
        navigate.push('/');
    };

    return (
        <Box data-testid="header-logo" onClick={goToHome} sx={{ height: '100%', cursor: 'pointer' }}>
            {theme?.productLogo?.logo ? <img height="100%" src={theme.productLogo.logo} /> : <XitasoLogo />}
        </Box>
    );
}
