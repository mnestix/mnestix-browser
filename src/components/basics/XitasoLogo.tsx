import { styled, useTheme } from '@mui/material';
import Logo from '../../assets/XitasoLogo.svg';

// May be extended with monochrome, reduced or other needed variants
export enum XitasoLogoVariant {
    Light = 'LIGHT',
    Dark = 'DARK',
}

type XitasoLogoProps = {
    readonly variant?: XitasoLogoVariant;
    readonly width?: string;
    readonly height?: string;
};

// Styling
const StyledLogo = styled(Logo)<{ width?: string; height?: string }>(({ width, height }) => ({
    maxWidth: '100%',
    maxHeight: '100%',
    width: width ?? '100%',
    height: height ?? 'auto',
    display: 'block',
}));

export function XitasoLogo(props: XitasoLogoProps) {
    // Differentiate between the logo variants
    const theme = useTheme();
    let color;
    switch (props.variant) {
        case XitasoLogoVariant.Light:
            color = theme.palette.common.white;
            break;
        case XitasoLogoVariant.Dark:
            color = theme.palette.primary.main;
            break;
        default:
            color = theme.palette.common.white;
    }

    return <StyledLogo width={props.width} height={props.height} color={color} />;
}
