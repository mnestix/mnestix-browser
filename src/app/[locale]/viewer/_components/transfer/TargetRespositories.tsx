import {
    Box,
    Button,
    DialogActions,
    Divider,
    FormControl,
    MenuItem,
    Skeleton,
    TextField,
    Typography
} from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    getConnectionDataByTypeAction
} from 'lib/services/database/MnestixConnectionServerActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Fragment, useState } from 'react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { ConnectionTypeEnum } from 'lib/services/database/ConnectionTypeEnum';
import { Controller, useForm } from 'react-hook-form';

export type TargetRepositoryFormData = {
    repository?: string;
    submodelRepository?: string;
}

type TargetRepositoryProps = {
    onSubmitStep: (values: TargetRepositoryFormData, redirectToNew: boolean) => void;
}

export function TargetRespositories(props: TargetRepositoryProps) {
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [aasRepositories, setAasRepositories] = useState<string[]>([]);
    const [submodelRepositories, setSubmodelRepositories] = useState<string[]>([]);
    const intl = useIntl();

    useAsyncEffect(async () => {
        try {
            setIsLoading(true);
            const aasRepositories = await getConnectionDataByTypeAction({ id: '0', typeName: ConnectionTypeEnum.AAS_REPOSITORY });
            setAasRepositories(aasRepositories);
            const submodelRepositories = await getConnectionDataByTypeAction({ id: '2', typeName: ConnectionTypeEnum.SUBMODEL_REPOSITORY });
            setSubmodelRepositories(submodelRepositories);
        } catch(error) {
            notificationSpawner.spawn({
                message: error,
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
        return;
    }, []);

    const { handleSubmit, control } = useForm();
    
    const onSubmit = (data: TargetRepositoryFormData) => {
        props.onSubmitStep(data, false);
    }

    const onSubmitRedirect = (data: TargetRepositoryFormData) => {
        props.onSubmitStep(data, true);
    }

    return(
        <>
            {isLoading ?
                [0, 1].map((i) => {
                    return (
                        <Fragment key={i}>
                            <Skeleton variant="text" width="50%" height={26} sx={{ m: 2 }}/>
                        </Fragment>
                    );
                }) :
                <form>
                    <Box display="flex" flexDirection="column">
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <Typography variant="h4"
                                        sx={{ minWidth: '200px', mr: 2 }}><FormattedMessage {...messages.mnestix.transfer.chooseRepository} /></Typography>
                            <FormControl fullWidth>
                                <Controller
                                    name="repository"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField fullWidth 
                                                   select
                                                   label={intl.formatMessage(messages.mnestix.transfer.repositoryLabel)}
                                                   required {...field}>{ aasRepositories.map((repo, index) => {
                                            return <MenuItem key={index} value={repo}>{repo}</MenuItem>
                                        })}
                                        </TextField>)}
                                />
                            </FormControl>
                        </Box>
                        <Box display="flex" flexDirection="row" mt={2} alignItems="center">
                            <Typography variant="h4"
                                        sx={{ minWidth: '200px', mr: 2 }}><FormattedMessage {...messages.mnestix.transfer.chooseSubmodelRepository} /></Typography>
                            <FormControl fullWidth>
                                <Controller
                                    name="submodelRepository"
                                    control={control}
                                    defaultValue="0"
                                    render={({ field }) => (
                                        <TextField fullWidth 
                                                   select
                                                   label={intl.formatMessage(messages.mnestix.transfer.submodelRepositoryLabel)}
                                                   {...field}>
                                            <MenuItem key="none" value="0"><FormattedMessage {...messages.mnestix.transfer.useAasRepository} /></MenuItem>
                                            { submodelRepositories.map((repo, index) => {
                                                return <MenuItem key={index} value={repo}>{repo}</MenuItem>
                                            })}
                                        </TextField>)}
                                />
                            </FormControl>
                        </Box>
                        <Divider sx={{ mt: 6, mb: 4 }}/>
                        <DialogActions>
                            <Button sx={{ mr: 1 }} variant="outlined" onClick={handleSubmit(onSubmit)}>Save & Back to Previous Aas</Button>
                            <Button variant="contained" type="submit" onClick={handleSubmit(onSubmitRedirect)}>Save & Go to new Aas</Button>
                        </DialogActions>
                    </Box>
                </form>
            }
        </>
    )
}