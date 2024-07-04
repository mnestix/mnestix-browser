import { Box } from '@mui/material';
import { AasListView } from 'app/[locale]/list/_components/AasListView';
import AasListHeader from 'app/[locale]/list/_components/AasListHeader';

export default function Page() {
    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <AasListHeader />
                <AasListView />
            </Box>
        </Box>
    );
}
