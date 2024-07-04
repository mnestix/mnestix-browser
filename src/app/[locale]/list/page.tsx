import { Box } from '@mui/material';
import { AasListView } from 'app/[locale]/list/_components/AasListView';
import ListHeader from 'components/basics/ListHeader';

export default function Page() {
    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <ListHeader namespace={'aasList'} keyValue={'header'} />
                <AasListView />
            </Box>
        </Box>
    );
}
