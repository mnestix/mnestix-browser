import {
    Box,
    Dialog,
    DialogContent,
    DialogProps,
    Divider,
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
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';

interface TransferDialogProps extends DialogProps {
    onTransfer: () => void;
    onClose: () => void;
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
    const notificationSpawner = useNotificationSpawner();

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
            targetSubmodelRepositoryBaseUrl: values.submodelRepository && values.submodelRepository !== '0' ? values.submodelRepository : ''
        }
        
        try {
            await transferAasWithSubmodels(dtoToSubmit);
        } catch(error) {
            notificationSpawner.spawn({
                message: error,
                severity: 'error',
            });
        } finally {
            notificationSpawner.spawn({
                message: 'Transfer of AAS successful',
                severity: 'success',
            });
            props.onClose();
        }
    }
    
    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth>
            <Box sx={{ m: 4 }}>
                <Typography variant="h2" color="primary"><FormattedMessage {...messages.mnestix.transfer.title}/></Typography>
                <Typography><FormattedMessage {...messages.mnestix.transfer.subtitle}/></Typography>
            </Box>
            <IconButton
                aria-label="close"
                onClick={() => props.onClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon/>
            </IconButton>
            <DialogContent sx={{ mr: 1, ml: 1 }}>
                <TargetRespositories onSubmitStep={ (values) => handleSubmitRepositoryStep(values) }/>
            </DialogContent>
            <Divider/>
        </Dialog>
    );
}