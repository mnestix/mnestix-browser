import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogTitle, Divider,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TargetRespositories } from 'app/[locale]/viewer/_components/transfer/TargetRespositories';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';

interface TransferDialogProps extends DialogProps {
    onTransfer: () => void;
}

export function TransferDialog(props: TransferDialogProps) {
    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 2 }}>
                <Typography variant="h2" color="primary">Export</Typography>
                <Typography><FormattedMessage {...messages.mnestix.transfer.subtitle}/></Typography>
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={(e) => props.onClose && props.onClose(e, 'escapeKeyDown')}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
            <CloseIcon />
        </IconButton>
            <DialogContent sx={{ m: 2 }}>
                <TargetRespositories/>
            </DialogContent>
            <Divider/>
            <DialogActions sx={{ m: 4 }}>
                <Button variant="outlined">Save & Back to Previous Aas</Button>
                <Button variant="contained">Save & Go to new Aas</Button>
            </DialogActions>
        </Dialog>
    );
}