import { Card, Grid, CardMedia, CardContent, Box, Button, styled } from '@mui/material';
import { AasListEntry } from 'lib/api/generated-api/clients.g';
import React from 'react';

// Define the props interface
interface AASCardProps {
    listEntry: AasListEntry;
    navigateToAas: (listEntry: AasListEntry) => void;
}

const StyledImage = styled('img')(() => ({
    maxHeight: '88px',
    maxWidth: '88px',
    width: '100%',
    objectFit: 'scale-down',
}));

// AASCard component
export const AASCard: React.FC<AASCardProps> = ({ listEntry, navigateToAas }) => {
    return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={listEntry.aasId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia>
                    <StyledImage src={listEntry.thumbnailUrl} alt={listEntry.aasId} />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                    {/* <Typography variant="h6">{tooltipText(listEntry.name, 50)}</Typography>
                        <Typography variant="body2">{tooltipText(listEntry.manufacturer, 50)}</Typography>
                        {productClassValue(listEntry.productGroup, 50)} */}
                    cardcontent text
                </CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                    }}
                >
                    {/* <Checkbox
                            checked={isItemSelected(listEntry.aasId)}
                            onChange={handleCheckboxChange(listEntry.aasId)}
                            disabled={checkBoxDisabled(listEntry.aasId)}
                        /> */}
                    <Button size="small" onClick={() => navigateToAas(listEntry)}>
                        viewbutton
                    </Button>
                </Box>
            </Card>
        </Grid>
    );
};
