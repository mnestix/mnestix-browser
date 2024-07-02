import { Box, Tooltip, Typography } from "@mui/material";

import dynamic from 'next/dynamic'

const TireRepairIcon = dynamic(() => import('@mui/icons-material/TireRepair'));
const FireHydrantAltIcon = dynamic(() => import('@mui/icons-material/FireHydrantAlt'));
const LabelIcon = dynamic(() => import('@mui/icons-material/Label'));

/**
 * Shortens the property text and provides the full text in a tooltip.
 */
export const tooltipText = (property: string | undefined, maxChars: number) => {
    if (!property) return '';
    else {
        return property.length > maxChars ? (
            <Tooltip title={property} arrow>
                <Box component="span">{`${property.slice(0, maxChars)} (...)`}</Box>
            </Tooltip>
        ) : (
            <>{property}</>
        );
    }
};

/**
 * Returns an icon component based on the provided product class type.
 * @param props
 */
export const GetProductClassIcon = ( props: { productClassType: string }) => {
    const {productClassType} = props;
    switch (productClassType) {
        case 'pneumatics':
            return <TireRepairIcon color={'primary'} />;
        case 'hydraulics':
            return <FireHydrantAltIcon color={'primary'} />;
        default:
            return <LabelIcon color={'primary'} />;
    }
};