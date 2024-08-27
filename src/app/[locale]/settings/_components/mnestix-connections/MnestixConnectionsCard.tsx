import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, Button, FormControl, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { MnestixConnection } from '.prisma/client';
import {
    getConnectionDataAction, upsertConnectionDataAction
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type ConnectionFormData = {
    repositories: {
        id: string
        url: string
        type: string
    }[]
}

export function MnestixConnectionsCard() {
    const notificationSpawner = useNotificationSpawner();
    const [isEditMode, setIsEditMode] = useState(false);
    const intl = useIntl();

    async function getConnectionData() {
        try {
            return await getConnectionDataAction()
        } catch (error) {
            notificationSpawner.spawn(error);
        }
        return
    }

    async function mapFormData() {
        const rawConnectionData = await getConnectionData()
        if (rawConnectionData) {
            const defaultFormData: ConnectionFormData = {
                repositories: rawConnectionData?.map((data) => ({
                    id: data.id,
                    url: data.url,
                    type: data.type.typeName
                }))
            }
            return defaultFormData;
        } else {
            return {repositories: []};
        }
    }

    const {
        control,
        handleSubmit,
        getValues,
        formState: {errors},
        reset,
    } = useForm<ConnectionFormData>({defaultValues: async () => await mapFormData()})

    const {fields, append, remove} = useFieldArray<ConnectionFormData>({
        control,
        name: "repositories",
    });

    async function saveConnectionData(data: ConnectionFormData) {
        try {
            await upsertConnectionDataAction(data)
            notificationSpawner.spawn({
                severity: 'success',
                message: intl.formatMessage(messages.mnestix.changesSavedSuccessfully),
            });
            setIsEditMode(false)
        } catch(error)
        {
            notificationSpawner.spawn(error);
        }
    }
    
    const cancelEdit = () => {
        reset();
        setIsEditMode(false)
    }

    return (
        <Box sx={{p: 3, width: '100%'}}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <CardHeading
                    title={<FormattedMessage {...messages.mnestix.mnestixConnections} />}
                    subtitle={<FormattedMessage {...messages.mnestix.mnestixConnectionsExplanation} />}
                />
                <Box display="flex" gap={2} alignContent="center" flexWrap="wrap"> {isEditMode ? (
                    <>
                        <Button variant="outlined" startIcon={<CloseIcon/>} onClick={() => cancelEdit()}><FormattedMessage {...messages.mnestix.cancel} /></Button>
                        <Button variant="contained" startIcon={<CheckIcon/>}
                                onClick={handleSubmit((data) => saveConnectionData(data))}><FormattedMessage {...messages.mnestix.mnestixConnectionsSaveButton} /></Button>
                    </>
                ) : (
                    <Button variant="contained" startIcon={<EditIcon/>}
                            onClick={() => setIsEditMode(true)}><FormattedMessage {...messages.mnestix.mnestixConnectionsEditButton} /></Button>
                )}
                </Box>
            </Box>
            <Box mt={3}>
                <Typography variant="h3" color="primary" mb={2}>
                    <FormattedMessage {...messages.mnestix.menstixConnectionsRepositories} />
                </Typography>
                {fields.map((field, index) =>
                    <FormControl fullWidth variant="filled" key={field.id}>
                        <Box display="flex" flexDirection="row" mb={2} alignItems="center">
                            <Typography variant="h4" mr={4}
                                        width="160px"><FormattedMessage {...messages.mnestix.menstixConnectionsRepositoryLabel} /></Typography>
                            {isEditMode ? (
                                <Box display="flex" alignItems="center" width="100%">
                                    <Controller
                                        name={`repositories.${index}.url`}
                                        control={control}
                                        defaultValue={field.url}
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                label={
                                                    <FormattedMessage {...messages.mnestix.menstixConnectionsRepositoryLabel} />}
                                                sx={{flexGrow: 1, mr: 1}}
                                                fullWidth={true}
                                                error={!!errors.repositories}
                                                helperText={!!errors.repositories}
                                            />
                                        )}/>
                                    <IconButton><RemoveCircleOutlineIcon onClick={() => remove(index)}/></IconButton>
                                </Box>
                            ) : (<Typography>{getValues(`repositories.${index}.url`)}</Typography>)}
                        </Box>
                    </FormControl>
                )}
                <Box>
                    <Button variant="text" startIcon={<ControlPointIcon/>}
                            onClick={() => append({id: 'temp', type: 'AAS_REPOSITORY', url: ''})}>
                        <FormattedMessage {...messages.mnestix.mnestixConnectionsAddButton} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}