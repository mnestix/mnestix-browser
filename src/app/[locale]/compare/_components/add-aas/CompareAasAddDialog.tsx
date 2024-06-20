import { Box, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import ScannerLogo from 'assets/ScannerLogo.svg';
import CloseIcon from '@mui/icons-material/Close';
import { ManualAasAddInput } from './ManualAasAddInput';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

type AddAasModalProps = {
    readonly handleClose: () => void;
    readonly open: boolean;
};

export function CompareAasAddDialog(props: AddAasModalProps) {
    const [inputFocus, setInputFocus] = useState<boolean>(true);
    const theme = useTheme();

    const focusInput = () => {
        // The value gets toggled to trigger the useEffect in the child input component 'ManualAasAddInput'.
        setInputFocus(!inputFocus);
    };

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            maxWidth="sm"
            fullWidth={true}
            data-testid="compare-aas-aad-dialog"
        >
            <IconButton
                aria-label="close"
                onClick={props.handleClose}
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
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            marginBottom="-40"
                            style={{ cursor: 'pointer' }}
                            onClick={focusInput}
                        >
                            <ScannerLogo style={{ color: theme.palette.primary.main }} alt="Scanner Logo" />
                        </Box>
                        <Typography color="text.secondary" textAlign="center" sx={{ mb: 2, fontSize: '14px' }}>
                            <FormattedMessage {...messages.mnestix.orEnterManual} />:
                        </Typography>
                    </Box>
                </Box>
                <Box paddingY="20px">
                    <ManualAasAddInput onSubmit={props.handleClose} focus={inputFocus} />
                </Box>
            </DialogContent>
        </Dialog>
    );
}
