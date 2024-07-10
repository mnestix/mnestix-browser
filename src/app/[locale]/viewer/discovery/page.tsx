import { Box } from '@mui/material';
import { DiscoveryListView } from 'app/[locale]/viewer/discovery/_components/DiscoveryListView';
import ListHeader from 'components/basics/ListHeader';

export default async function page() {
    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <ListHeader namespace={'discoveryList'} keyValue={'header'} />
                <DiscoveryListView />
            </Box>
        </Box>
    );
}