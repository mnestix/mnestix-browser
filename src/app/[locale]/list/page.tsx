import { Box, Typography } from '@mui/material';
import { AASListView } from './_components/AASListView';
import { getTranslations } from 'next-intl/server';

export default async function page() {
    const t = await getTranslations('aas-list');
    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <Typography variant="h2" textAlign="left" marginBottom={2}>
                    {t('header')}
                </Typography>
                <AASListView />
            </Box>
        </Box>
    );
}
