import { Box, TextField, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';

export function TargetRespositories() {

    return(
        <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row" alignItems="center">
                <Typography sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseRepository} /></Typography>
                <TextField fullWidth select><option key={1} value={2}>test</option></TextField>
            </Box>
            <Box display="flex" flexDirection="row" mt={2} alignItems="center">
                <Typography sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseSubmodelRepository} /></Typography>
                <TextField fullWidth select><option key={1} value={2}>test</option></TextField>
            </Box>
        </Box>
    )
}