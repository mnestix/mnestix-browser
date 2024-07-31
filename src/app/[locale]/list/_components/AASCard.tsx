'use client';
import React, { useState } from 'react';
import {
    Card,
    Grid,
    CardMedia,
    CardContent,
    Box,
    Button,
    styled,
    IconButton,
    Typography,
    Divider,
    Chip,
} from '@mui/material';
import { Description, Menu, LabelOff } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import { AasListEntry } from 'lib/api/generated-api/clients.g';
import { productClassValue, tooltipText, translateListText } from './AASListView';
import { ShellIcon } from 'components/custom-icons/ShellIcon';
import { messages } from 'lib/i18n/localization';
import { getProductClassId } from 'lib/util/ProductClassResolverUtil';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';

// Define the props interface
interface AASCardProps {
    aasListEntry: AasListEntry;
    navigateToAas: (listEntry: AasListEntry) => void;
}

const StyledImage = styled('img')(() => ({
    maxHeight: '143px',
}));

const StyledTypography = styled(Typography)(() => ({
    height: '1.5em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// AASCard component
export const AASCard: React.FC<AASCardProps> = ({ aasListEntry, navigateToAas }) => {
    const [productImageUrl, setProductImageUrl] = useState<string | undefined>('');
    const { repositoryClient } = useApis();

    // Get the image url from aasId, set with thumbnail url if no image is found
    useAsyncEffect(async () => {
        if (!aasListEntry || !aasListEntry.aasId) return;

        try {
            const image = await repositoryClient.getThumbnailFromShell(aasListEntry.aasId);
            setProductImageUrl(URL.createObjectURL(image));
        } catch (error) {
            setProductImageUrl(aasListEntry.thumbnailUrl);
        }
    }, [aasListEntry]);

    return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={aasListEntry.aasId}>
            <Card sx={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
                <CardMedia sx={{ display: 'flex', justifyContent: 'center', height: '143px' }}>
                    {productImageUrl ? (
                        <StyledImage src={productImageUrl} alt={aasListEntry.aasId} />
                    ) : (
                        <ShellIcon fontSize="large" color="primary" />
                    )}
                </CardMedia>
                <Divider
                    sx={{
                        borderColor: '#0000004D',
                    }}
                />
                <CardContent
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                    <StyledTypography>{aasListEntry.productModel}</StyledTypography>
                    <StyledTypography>{aasListEntry.deviceType}</StyledTypography>
                    <StyledTypography>{aasListEntry.aasVersion}</StyledTypography>

                    {/* <Typography variant="h6">{tooltipText(listEntry.name, 50)}</Typography>
                    <Typography variant="body2">{tooltipText(listEntry.manufacturer, 50)}</Typography>
                    {productClassValue(listEntry.productGroup, 50)} */}
                    {/* <Typography>
                        {tooltipText(translateListText(aasListEntry.manufacturerProductDesignation), 100)}
                    </Typography>
                    <Typography>{translateListText(aasListEntry.manufacturerName)}</Typography>
                    <Typography sx={{ letterSpacing: '0.16px' }}>
                        <FormattedMessage {...messages.mnestix.aasList.assetIdHeading} />
                        {tooltipText(aasListEntry.assetId, 100)}
                    </Typography> */}
                    {/* <Typography sx={{ letterSpacing: '0.16px' }}>
                        <FormattedMessage {...messages.mnestix.aasList.aasIdHeading} />
                        {tooltipText(aasListEntry.aasId, 100)}
                    </Typography> */}
                    {/* {aasListEntry.productGroup ? (
                        <Typography>{productClassValue(getProductClassId(aasListEntry.productGroup), 25)}</Typography>
                    ) : (
                        <Chip
                            sx={{ paddingX: '16px', paddingY: '6px' }}
                            color={'primary'}
                            label={<FormattedMessage {...messages.mnestix.aasList.notAvailable} />}
                            variant="outlined"
                            icon={<LabelOff color={'primary'} />}
                            data-testid="product-class-chip"
                        />
                    )} */}
                </CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        mt: 'auto',
                    }}
                >
                    {/* <Checkbox
                        checked={isItemSelected(listEntry.aasId)}
                        onChange={handleCheckboxChange(listEntry.aasId)}
                        disabled={checkBoxDisabled(listEntry.aasId)}
                    /> */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '8px', // Controls the space between buttons
                        }}
                    >
                        <StyledIconButton>
                            <Description />
                        </StyledIconButton>
                        <StyledIconButton>
                            <Menu />
                        </StyledIconButton>
                    </Box>
                    <Button size="small" onClick={() => navigateToAas(aasListEntry)}>
                        more detail
                    </Button>
                </Box>
            </Card>
        </Grid>
    );
};
