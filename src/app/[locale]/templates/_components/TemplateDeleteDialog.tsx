import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';

interface TemplateDeleteDialogProps extends DialogProps {
    itemName: string | null;
    onDelete: () => void;
}

export function TemplateDeleteDialog(props: TemplateDeleteDialogProps) {
    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogContent>
                <DialogContentText>
                    <FormattedMessage {...messages.mnestix.deleteTemplateQuestion} values={{ name: props.itemName }} />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => props.onClose && props.onClose(e, 'escapeKeyDown')} autoFocus>
                    <FormattedMessage {...messages.mnestix.cancel} />
                </Button>
                <Button onClick={() => props.onDelete()} color="error">
                    <FormattedMessage {...messages.mnestix.delete} />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
