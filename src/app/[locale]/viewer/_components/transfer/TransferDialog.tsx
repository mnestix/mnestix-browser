import {
    Dialog,
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
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { useEffect, useState } from 'react';
import { SubmodelOrIdReference, useAasState, useSubmodelState } from 'components/contexts/CurrentAasContext';
import { transferAasWithSubmodels, TransferDto } from 'lib/services/transfer-service/transferActions';

interface TransferDialogProps extends DialogProps {
    onTransfer: () => void;
}

export type TransferFormModel = {
    targetAasRepositoryBaseUrl?: string;
    targetSubmodelRepositoryBaseUrl?: string;
    aas?: AssetAdministrationShell | null;
    submodels?: SubmodelOrIdReference[];
};

export function TransferDialog(props: TransferDialogProps) {
    const [ transferDto, setTransferDto ] = useState<TransferFormModel>();
    const [submodelsFromContext, ] = useSubmodelState();
    const [aasFromContext, ] = useAasState();


    useEffect(() => {
        const transferDtoTemp = { ...transferDto, aas: aasFromContext, submodels: submodelsFromContext }

        setTransferDto(transferDtoTemp)
    }, [])
    
    const handleSubmitRepositoryStep = async (values: TargetRepositoryFormData) => {
        if (!values.repository ||!aasFromContext || !values.repository) {
            return;
        }
        
        // This state can be used later to hold the data of multiple steps
        const transferDtoTemp = { ...transferDto, targetAasRepositoryBaseUrl: values.repository, targetSubmodelRepositoryBaseUrl: values.submodelRepository }
        setTransferDto(transferDtoTemp)
        
        const dtoToSubmit: TransferDto = {
            submodels: submodelsFromContext.filter((sub) => sub.submodel).map((sub) => sub.submodel!),
            aas: aasFromContext,
            targetAasRepositoryBaseUrl: values.repository,
            targetSubmodelRepositoryBaseUrl: values.submodelRepository ?? ''
        }

        await transferAasWithSubmodels(dtoToSubmit);
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