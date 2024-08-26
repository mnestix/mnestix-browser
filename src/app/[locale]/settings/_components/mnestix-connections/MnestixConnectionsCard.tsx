import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box } from '@mui/material';

export function MnestixConnectionsCard() {
    return (
        <Box sx={{p: 3, width: '100%'}}>
            <CardHeading
                title={<FormattedMessage {...messages.mnestix.mnestixConnections} />}
                subtitle={<FormattedMessage {...messages.mnestix.mnestixConnectionsExplanation} />}
            />
            <Box minHeight='300px'>
               todo: content will follow
            </Box>
        </Box>
    );
}