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
} from '@mui/material';
import { AasListEntry } from 'lib/api/generated-api/clients.g';
import React from 'react';
import { Description, Menu } from '@mui/icons-material';
import { tooltipText, translateListText } from './AASListView';

// Define the props interface
interface AASCardProps {
    aasListEntry: AasListEntry;
    navigateToAas: (listEntry: AasListEntry) => void;
}

const StyledImage = styled('img')(() => ({
    height: '143px',
    width: '75px',
    objectFit: 'scale-down',
}));

// AASCard component
export const AASCard: React.FC<AASCardProps> = ({ aasListEntry, navigateToAas }) => {
    return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={aasListEntry.aasId}>
            <Card sx={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
                <CardMedia sx={{ display: 'flex', justifyContent: 'center' }}>
                    <StyledImage src={aasListEntry.thumbnailUrl} alt={aasListEntry.aasId} />
                </CardMedia>
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                    {/* <Typography variant="h6">{tooltipText(listEntry.name, 50)}</Typography>
                    <Typography variant="body2">{tooltipText(listEntry.manufacturer, 50)}</Typography>
                    {productClassValue(listEntry.productGroup, 50)} */}
                    <Typography>
                        {tooltipText(translateListText(aasListEntry.manufacturerProductDesignation), 100)}
                    </Typography>
                    <Typography>{tooltipText(aasListEntry.productGroup, 50)}</Typography>
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
                    <div>
                        <IconButton>
                            <Description />
                        </IconButton>
                        <IconButton>
                            <Menu />
                        </IconButton>
                    </div>
                    <Button size="small" onClick={() => navigateToAas(aasListEntry)}>
                        more detail
                    </Button>
                </Box>
            </Card>
        </Grid>
    );
};
