// app/page.tsx
import { Box } from '@mui/material';
import { AASListView } from './_components/AASListView';
import { getTranslations } from 'next-intl/server';
import { SearchSortBar } from './_components/SearchSortBar';
import { AASListHeader } from './_components/AASListHeader';

export default async function Page() {
    const t = await getTranslations('aas-list');

    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <AASListHeader
                    welcomeText={t('welcome')}
                    technicalProductCatalogText={t('technical-product-catalog')}
                />
                <SearchSortBar />
                <AASListView />
            </Box>
        </Box>
    );
}
