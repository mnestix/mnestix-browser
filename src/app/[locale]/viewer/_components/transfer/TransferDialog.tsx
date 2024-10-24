import {
    Box,
    Dialog,
    DialogContent,
    DialogProps,
    Divider,
    IconButton,
    Typography, useMediaQuery, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    TargetRepositoryFormData,
    TargetRepositories
} from 'app/[locale]/viewer/_components/transfer/TargetRepositories';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { useEffect, useState } from 'react';
import { SubmodelOrIdReference, useAasState, useSubmodelState } from 'components/contexts/CurrentAasContext';
import { transferAasWithSubmodels } from 'lib/services/transfer-service/transferActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { TransferDto, TransferResult } from 'lib/types/TransferServiceData';

export type TransferFormModel = {
    targetAasRepositoryBaseUrl?: string;
    targetSubmodelRepositoryBaseUrl?: string;
    aas?: AssetAdministrationShell | null;
    submodels?: SubmodelOrIdReference[];
    apiKey?: string;
};

export function TransferDialog(props: DialogProps) {
    const [transferDto, setTransferDto] = useState<TransferFormModel>();
    const [submodelsFromContext,] = useSubmodelState();
    const [aasFromContext,] = useAasState();
    const notificationSpawner = useNotificationSpawner();
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const transferDtoTemp = { ...transferDto, aas: aasFromContext, submodels: submodelsFromContext }

        setTransferDto(transferDtoTemp)
    }, [submodelsFromContext, aasFromContext])

    const handleSubmitRepositoryStep = async (values: TargetRepositoryFormData) => {
        if (!values.repository || !aasFromContext || !values.repository) {
            return;
        }

        // This state can be used later to hold the data of multiple steps
        const transferDtoTemp = {
            ...transferDto,
            targetAasRepositoryBaseUrl: values.repository,
            targetSubmodelRepositoryBaseUrl: values.submodelRepository,
            apiKey: values.repositoryApiKey
        }
        setTransferDto(transferDtoTemp)

        const dtoToSubmit: TransferDto = {
            submodels: submodelsFromContext.filter((sub) => sub.submodel).map((sub) => sub.submodel!),
            aas: aasFromContext,
            targetAasRepositoryBaseUrl: values.repository,
            targetSubmodelRepositoryBaseUrl: values.submodelRepository && values.submodelRepository !== '0' ? values.submodelRepository : values.repository,
            apikey: values.repositoryApiKey
        }

        try {
            setIsSubmitting(true)
            const response = await transferAasWithSubmodels(dtoToSubmit);
            processResult(response)

        } catch (error) {
            notificationSpawner.spawn({
                message: 'Transfer of AAS not successful',
                severity: 'error',
            });
        } finally {
            props.onClose && props.onClose({}, 'escapeKeyDown');
            setIsSubmitting(false)
        }
    }

    /**
     * Shows success if all elements got transferred correctly.
     * Shows error if no element got transferred correctly.
     * If only parts of the AAS got transferred, 
     * shows an error for each failed element and a warning in the end.
     * @param result List of all transfer Results.
     */
    const processResult = (result: TransferResult[]) => {
        if(result.every(result => result.success)) {
            notificationSpawner.spawn({
                message: 'Transfer of AAS successful',
                severity: 'success',
            });
            return;
        }
        if(result.every(result => !result.success)) {
            notificationSpawner.spawn({
                message: 'Transfer of AAS not successful',
                severity: 'error',
            });
            return;
        } else {
            result.map(result => {
                if(!result.success) {
                    notificationSpawner.spawn({
                        message: `Failed to transfer single element: ${result.error}`,
                        severity: 'error',
                    });
                }
                notificationSpawner.spawn({
                    message: 'AAS was only partially transferred.',
                    severity: 'warning',
                });
            })
        }
    }

    return (
        <>
            <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth fullScreen={fullScreen} closeAfterTransition={false}>
                <Box sx={{ m: 4 }}>
                    <Typography variant="h2"
                                color="primary"><FormattedMessage {...messages.mnestix.transfer.title}/></Typography>
                    <Typography><FormattedMessage {...messages.mnestix.transfer.subtitle}/></Typography>
                </Box>
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
                <DialogContent sx={{ mr: 1, ml: 1 }}>
                    <TargetRepositories onSubmitStep={(values) => handleSubmitRepositoryStep(values)} isSubmitting={isSubmitting} />
                </DialogContent>
                <Divider/>
            </Dialog>
        </>
    );
}