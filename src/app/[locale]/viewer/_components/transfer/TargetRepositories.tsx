import {
    Box,
    DialogActions,
    Divider,
    FormControl, IconButton, InputAdornment,
    MenuItem,
    Skeleton,
    TextField,
    Typography
} from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    getConnectionDataByTypeAction
} from 'lib/services/database/connectionServerActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { ChangeEvent, Fragment, useState } from 'react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { ConnectionTypeEnum } from 'lib/services/database/ConnectionTypeEnum';
import { Controller, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { useEnv } from 'app/env/provider';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type TargetRepositoryFormData = {
    repository?: string;
    submodelRepository?: string;
    repositoryApiKey?: string;
}

type TargetRepositoryProps = {
    onSubmitStep: (values: TargetRepositoryFormData) => void;
    isSubmitting: boolean;
}

export function TargetRepositories(props: TargetRepositoryProps) {
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [aasRepositories, setAasRepositories] = useState<string[]>([]);
    const [submodelRepositories, setSubmodelRepositories] = useState<string[]>([]);
    const [showApikey, setShowApikey] = useState(false);
    const intl = useIntl();
    const env = useEnv();

    useAsyncEffect(async () => {
        try {
            setIsLoading(true);
            const aasRepositories = await getConnectionDataByTypeAction({
                id: '0',
                typeName: ConnectionTypeEnum.AAS_REPOSITORY
            });
            if (env.AAS_REPO_API_URL) aasRepositories.push(env.AAS_REPO_API_URL)
            setAasRepositories(aasRepositories);
            const submodelRepositories = await getConnectionDataByTypeAction({
                id: '2',
                typeName: ConnectionTypeEnum.SUBMODEL_REPOSITORY
            });
            if (env.SUBMODEL_REPO_API_URL) submodelRepositories.push(env.SUBMODEL_REPO_API_URL)
            
            setSubmodelRepositories(submodelRepositories);
        } catch (error) {
            notificationSpawner.spawn({
                message: error,
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
        return;
    }, []);
    
    const defaultValues = {
        repository: '',
        submodelRepository: '0',
        repositoryApiKey: localStorage.getItem('TransferApiKey') || ''
    }

    const { handleSubmit, control, formState } = useForm({ defaultValues });

    const onSubmit = (data: TargetRepositoryFormData) => {
        props.onSubmitStep(data);
    }

    const handleClickShowApikey = () => setShowApikey((show) => !show);

    const saveApiKeyToLocalStorage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        localStorage.setItem('TransferApiKey', event.target.value);
    }

    return (
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
                        <Box display="flex" flexDirection="row" alignItems="flex-start">
                            <Typography variant="h4"
                                        sx={{
                                            minWidth: '250px',
                                            mr: 2
                                        }}><FormattedMessage {...messages.mnestix.transfer.chooseRepository} /></Typography>
                            <Box display="flex" flexDirection="column" width="100%">
                                <FormControl fullWidth>
                                    <Controller
                                        name="repository"
                                        control={control}
                                        rules={{ required: intl.formatMessage(messages.mnestix.transfer.repositoryRequired) }}
                                        render={({ field, fieldState }) => (
                                            <TextField fullWidth
                                                       select
                                                       label={intl.formatMessage(messages.mnestix.transfer.repositoryLabel)}
                                                       error={!!fieldState.error}
                                                       helperText={fieldState.error ? fieldState.error.message : null}
                                                       required {...field}>
                                                {aasRepositories.map((repo, index) => {
                                                    return <MenuItem key={index} value={repo}>{repo}</MenuItem>
                                                })}
                                            </TextField>)}
                                    />
                                </FormControl>
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <Controller
                                        name="repositoryApiKey"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField type={showApikey ? 'text' : 'password'}
                                                       InputProps={{
                                                           endAdornment:
                                                               <InputAdornment position="end">
                                                                   <IconButton
                                                                       onClick={handleClickShowApikey}
                                                                       edge="end"
                                                                   >
                                                                       {showApikey ? <VisibilityOff/> : <Visibility/>}
                                                                   </IconButton>
                                                               </InputAdornment>
                                                       }}
                                                       {...field}
                                                       onChange={(event) => {
                                                           field.onChange(event);
                                                           saveApiKeyToLocalStorage(event)
                                                       }}
                                                       label={intl.formatMessage(messages.mnestix.transfer.repositoryApiKey)}
                                            />)}
                                    />
                                </FormControl>
                            </Box>
                        </Box>
                        <Box display="flex" flexDirection="row" mt={5} alignItems="flex-start">
                            <Typography variant="h4"
                                        sx={{
                                            minWidth: '250px',
                                            mr: 2
                                        }}><FormattedMessage {...messages.mnestix.transfer.chooseSubmodelRepository} /></Typography>
                            <FormControl fullWidth>
                                <Controller
                                    name="submodelRepository"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField fullWidth
                                                   select
                                                   label={intl.formatMessage(messages.mnestix.transfer.submodelRepositoryLabel)}
                                                   {...field}>
                                            <MenuItem key="none"
                                                      value="0"><FormattedMessage {...messages.mnestix.transfer.useAasRepository} /></MenuItem>
                                            {submodelRepositories.map((repo, index) => {
                                                return <MenuItem key={index} value={repo}>{repo}</MenuItem>
                                            })}
                                        </TextField>)}
                                />
                            </FormControl>
                        </Box>
                        <Divider sx={{ mt: 6, mb: 4 }}/>
                        <DialogActions>
                            <LoadingButton sx={{ mr: 1 }} variant="outlined" disabled={!formState.isValid}
                                           loading={props.isSubmitting}
                                           onClick={handleSubmit(onSubmit)}><FormattedMessage {...messages.mnestix.transfer.title} /></LoadingButton>
                        </DialogActions>
                    </Box>
                </form>
            }
        </>
    )
}