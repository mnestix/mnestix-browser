import {
    Box,
    Dialog,
    DialogContent,
    DialogProps,
    Divider,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    TargetRepositories,
    TargetRepositoryFormData,
} from 'app/[locale]/viewer/_components/transfer/TargetRepositories';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { useState } from 'react';
import { useAasState, useSubmodelState } from 'components/contexts/CurrentAasContext';
import { transferAasWithSubmodels } from 'lib/services/transfer-service/transferActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { TransferDto, TransferResult } from 'lib/types/TransferServiceData';

export type TransferFormModel = {
    targetAasRepositoryFormModel: TargetRepositoryFormData;
};

export function TransferDialog(props: DialogProps) {
    const [transferDto, setTransferDto] = useState<TransferFormModel>();
    const [submodelsFromContext] = useSubmodelState();
    const [aasFromContext] = useAasState();
    const notificationSpawner = useNotificationSpawner();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const theme = useTheme();
    const intl = useIntl();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmitRepositoryStep = async (values: TargetRepositoryFormData) => {
        if (!values.repository || !aasFromContext) {
            return;
        }

        // This state can be used later to hold the data of multiple steps
        setTransferDto({ ...transferDto, targetAasRepositoryFormModel: values });

        const dtoToSubmit: TransferDto = {
            aas: aasFromContext,
            submodels: submodelsFromContext.filter((sub) => sub.submodel).map((sub) => sub.submodel!),
            targetAasRepositoryBaseUrl: values.repository,
            targetSubmodelRepositoryBaseUrl:
                values.submodelRepository && values.submodelRepository !== '0'
                    ? values.submodelRepository
                    : values.repository,
            apikey: values.repositoryApiKey,
        };

        try {
            setIsSubmitting(true);
            const response = await transferAasWithSubmodels(dtoToSubmit);
            processResult(response);
        } catch (error) {
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.transfer.errorToast),
                severity: 'error',
            });
        } finally {
            props.onClose && props.onClose({}, 'escapeKeyDown');
            setIsSubmitting(false);
        }
    };

    /**
     * Shows success if all elements got transferred correctly.
     * Shows error if no element got transferred correctly.
     * If only parts of the AAS got transferred,
     * shows an error for each failed element and a warning in the end.
     * @param result List of all transfer Results.
     */
    const processResult = (result: TransferResult[]) => {
        if (result.every((result) => result.success)) {
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.transfer.successfullToast),
                severity: 'success',
            });
        } else if (result.every((result) => !result.success)) {
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.transfer.errorToast),
                severity: 'error',
            });
        } else {
            result.map((result) => {
                if (!result.success) {
                    notificationSpawner.spawn({
                        message: `${intl.formatMessage(messages.mnestix.transfer.partiallyFailedToast)}: ${result.error}`,
                        severity: 'error',
                    });
                }
                notificationSpawner.spawn({
                    message: intl.formatMessage(messages.mnestix.transfer.warningToast),
                    severity: 'warning',
                });
            });
        }
    };

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            maxWidth="md"
            fullWidth
            fullScreen={fullScreen}
            closeAfterTransition={false}
        >
            <Box sx={{ m: 4 }}>
                <Typography variant="h2" color="primary">
                    <FormattedMessage {...messages.mnestix.transfer.title} />
                </Typography>
                <Typography>
                    <FormattedMessage {...messages.mnestix.transfer.subtitle} />
                </Typography>
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
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ mr: 1, ml: 1 }}>
                <TargetRepositories
                    onSubmitStep={(values) => handleSubmitRepositoryStep(values)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
            <Divider />
        </Dialog>
    );
}
