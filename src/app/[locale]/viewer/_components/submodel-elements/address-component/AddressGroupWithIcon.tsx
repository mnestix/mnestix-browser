import { Place } from '@mui/icons-material';
import { Box, BoxProps } from '@mui/material';
import { IconCircleWrapper } from 'components/basics/IconCircleWrapper';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { ReactNode } from 'react';

interface AddressGroupWithIconProps extends BoxProps {
    readonly icon?: ReactNode;
}

export function AddressGroupWithIcon(props: AddressGroupWithIconProps) {
    const isMobile = useIsMobile();

    let propertyMobileStyle = '';

    if (isMobile) {
        propertyMobileStyle = '.properties .MuiBox-root {display: inline-block; margin-top: 15px }';
    }

    return (
        <Box sx={{ mt: 2, display: 'flex', ...props.sx }}>
            <Box sx={{ mr: 2 }}>
                <IconCircleWrapper>{props.icon ?? <Place color="primary" fontSize="small" />}</IconCircleWrapper>
            </Box>

            <style>{propertyMobileStyle}</style>
            <Box className="properties" sx={{ mt: '2px' }}>
                {props.children}
            </Box>
        </Box>
    );
}
