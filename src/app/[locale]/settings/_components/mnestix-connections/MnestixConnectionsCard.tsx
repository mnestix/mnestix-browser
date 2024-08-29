import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, Button, Divider, FormControl, IconButton, Skeleton, TextField, Typography } from '@mui/material';
import { Fragment, useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import {
    getConnectionDataAction,
    upsertConnectionDataAction,
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Controller, FieldArrayWithId, useFieldArray, useForm } from 'react-hook-form';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useEnv } from 'app/env/provider';
import { SettingsCardHeader } from 'app/[locale]/settings/_components/SettingsCardHeader';

export type ConnectionFormData = {
    repositories: {
        id: string;
        url: string;
        type: string;
    }[];
};

export function MnestixConnectionsCard() {
    const notificationSpawner = useNotificationSpawner();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const intl = useIntl();
    const env = useEnv();

    async function getConnectionData() {
        try {
            setIsLoading(true);
            return await getConnectionDataAction();
        } catch (error) {
            notificationSpawner.spawn(error);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    async function mapFormData() {
        const rawConnectionData = await getConnectionData();
        if (rawConnectionData) {
            const defaultFormData: ConnectionFormData = {
                repositories: rawConnectionData?.map((data) => ({
                    id: data.id,
                    url: data.url,
                    type: data.type.typeName,
                })),
            };
            return defaultFormData;
        } else {
            return {repositories: []};
        }
    }

    const {
        control,
        handleSubmit,
        getValues,
        reset,
    } = useForm<ConnectionFormData>({defaultValues: async () => await mapFormData()});

    const {fields, append, remove} = useFieldArray<ConnectionFormData>({
        control,
        name: 'repositories',
    });

    async function saveConnectionData(data: ConnectionFormData) {
        try {
            await upsertConnectionDataAction(data);
            notificationSpawner.spawn({
                severity: 'success',
                message: intl.formatMessage(messages.mnestix.changesSavedSuccessfully),
            });
            setIsEditMode(false);
        } catch (error) {
            notificationSpawner.spawn(error);
        }
    }

    const cancelEdit = () => {
        reset();
        setIsEditMode(false);
    };

    function getFormControl(field: FieldArrayWithId<ConnectionFormData, 'repositories', 'id'>, index: number) {
        return (
            <FormControl fullWidth variant="filled" key={field.id}>
                <Box display="flex" flexDirection="row" mb={2} alignItems="center">
                    <Typography variant="h4" mr={4} width="160px">
                        <FormattedMessage {...messages.mnestix.connections.repositoryLabel} />
                    </Typography>
                    {isEditMode ? (
                        <Box display="flex" alignItems="center" width="100%">
                            <Controller
                                name={`repositories.${index}.url`}
                                control={control}
                                defaultValue={field.url}
                                rules={{required: intl.formatMessage(messages.mnestix.connections.urlFieldRequired)}}
                                render={({field, fieldState: {error}}) => (
                                    <TextField
                                        {...field}
                                        label={
                                            <FormattedMessage {...messages.mnestix.connections.repositoryUrlLabel} />}
                                        sx={{flexGrow: 1, mr: 1}}
                                        fullWidth={true}
                                        error={!!error}
                                        helperText={error ? error.message : ''}
                                    />
                                )}
                            />
                            <IconButton>
                                <RemoveCircleOutlineIcon onClick={() => remove(index)}/>
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography mb={2} mt={2}>{getValues(`repositories.${index}.url`)}</Typography>
                    )}
                </Box>
            </FormControl>
        );
    }

    return (
        <Box sx={{p: 3, width: '100%'}}>
            <SettingsCardHeader title={<FormattedMessage {...messages.mnestix.connections.title} />}
                                subtitle={<FormattedMessage {...messages.mnestix.connections.subtitle} />}
                                onCancel={() => cancelEdit()} onEdit={() => setIsEditMode(true)}
                                onSubmit={handleSubmit((data) => saveConnectionData(data))}
                                isEditMode={isEditMode}/>
            <Box sx={{my: 2}}>
                <Divider/>
                <Typography variant="h3" color="primary" sx={{my: 2}}>
                    <FormattedMessage {...messages.mnestix.connections.repositories} />
                </Typography>
                <Box display="flex" flexDirection="row" mb={4} alignItems="center">
                    <Typography variant="h4" mr={4} width="200px">
                        <FormattedMessage {...messages.mnestix.connections.repositoryDefaultLabel} />
                    </Typography>
                    <Typography>{env.AAS_REPO_API_URL}</Typography>
                </Box>
                {isLoading &&
                    !fields.length &&
                    [0, 1, 2].map((i) => {
                        return (
                            <Fragment key={i}>
                                <Skeleton variant="text" width="50%" height={26} sx={{m: 2}}/>
                            </Fragment>
                        );
                })}
                {!isLoading && fields.map((field, index) => getFormControl(field, index))}
                <Box>
                    <Button
                        variant="text"
                        startIcon={<ControlPointIcon/>}
                        onClick={() => {
                            setIsEditMode(true);
                            append({id: 'temp', type: 'AAS_REPOSITORY', url: ''});
                        }}
                    >
                        <FormattedMessage {...messages.mnestix.connections.addButton} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
