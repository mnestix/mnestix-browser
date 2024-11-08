import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { TransferDialog } from 'app/[locale]/viewer/_components/transfer/TransferDialog';
import { useState } from 'react';

export function TransferButton() {
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    
    const startTransfer = () => {
        setTransferDialogOpen(true);
    };
    
    const closeDialog = () => {
        setTransferDialogOpen(false);
    }

    return (  
        <>
            <Button variant="outlined" onClick={startTransfer} data-testid="detail-transfer-button">
                <FormattedMessage {...messages.mnestix.transfer.title} />
            </Button>
            <TransferDialog open={transferDialogOpen} onClose={closeDialog}/>
        </>
    )
}