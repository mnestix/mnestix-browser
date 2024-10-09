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
import {
    TargetRepositoryFormData,
    TargetRespositories
} from 'app/[locale]/viewer/_components/transfer/TargetRespositories';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { useState } from 'react';

interface TransferDialogProps extends DialogProps {
    onTransfer: () => void;
}

export type TransferDto = {
    targetAasRepositoryBaseUrl: string;
    targetSubmodelRepositoryBaseUrl?: string;
    aas?: AssetAdministrationShell;
    submodels?: Submodel[];
};

export function TransferDialog(props: TransferDialogProps) {
    const [ transferDto, setTransferDto ] = useState<TransferDto>();
    
    const handleSubmitRepositoryStep = (values: TargetRepositoryFormData) => {
        if (!values.repository) {
            return;
        }
        const transferDtoTemp = { ...transferDto, targetAasRepositoryBaseUrl: values.repository, targetSubmodelRepositoryBaseUrl: values.submodelRepository }
        setTransferDto(transferDtoTemp)
    }
    
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
                <CloseIcon/>
            </IconButton>
            <DialogContent sx={{ mr: 2, ml: 2 }}>
                <TargetRespositories onSubmitStep={ (values) => handleSubmitRepositoryStep(values) }/>
            </DialogContent>
            <Divider/>
        </Dialog>
    );
}