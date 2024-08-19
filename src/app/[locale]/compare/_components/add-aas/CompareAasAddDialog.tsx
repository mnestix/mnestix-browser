import { Box, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import CloseIcon from '@mui/icons-material/Close';
import { QrScanner } from 'app/[locale]/_components/QrScanner';
import { ManualAasInput } from 'app/[locale]/_components/ManualAasInput';

type AddAasModalProps = {
    readonly onSubmit: (result: string) => Promise<void>;
    readonly onClose: () => void;
    readonly open: boolean;
};

export function CompareAasAddDialog(props: AddAasModalProps) {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            maxWidth="sm"
            fullWidth={true}
            data-testid="compare-aas-aad-dialog"
        >
            <IconButton
                aria-label="close"
                onClick={props.onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent style={{ paddingLeft: '60px', paddingRight: '60px' }}>
                <Box display="flex" flexDirection="column" gap="20px">
                    <Typography variant="h2" textAlign="center" margin="30px 0">
                        <FormattedMessage {...messages.mnestix.compare.addAnother} />:
                    </Typography>
                    <Box>
                        <Typography color="text.secondary" textAlign="center">
                            <FormattedMessage {...messages.mnestix.scanAasId} />
                        </Typography>
                        <QrScanner onScan={props.onSubmit} size={400}  />
                        <Typography color="text.secondary" textAlign="center" sx={{ mb: 2, fontSize: '14px' }}>
                            <FormattedMessage {...messages.mnestix.orEnterManual} />:
                        </Typography>
                    </Box>
                </Box>
                <Box paddingY="20px">
                    <ManualAasInput onSubmit={props.onSubmit} />
                </Box>
            </DialogContent>
        </Dialog>
    );
}
