import { Box, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MnestixLogo } from 'components/basics/MnestixLogo';
import Image from 'next/image';
export function HeaderLogo() {
    const theme = useTheme();
    const navigate = useRouter();

    const goToHome = () => {
        navigate.push('/');
    };

    return (
        <Box data-testid="header-logo" onClick={goToHome} sx={{ height: '100%', cursor: 'pointer' }}>
            {theme?.productLogo?.logo ? <Image style={{ height: '100%' }} src={theme.productLogo.logo} alt={'default Mnestix logo'} /> : <MnestixLogo />}
        </Box>
    );
}
