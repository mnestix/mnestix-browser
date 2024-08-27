import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, Button, FormControl, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { MnestixConnection } from '.prisma/client';
import {
    getConnectionDataAction
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
type ConnectionFormData = {
    repositories: {
        id: string
        url: string
        type: string
    }[]
}

export function MnestixConnectionsCard() {
    const notificationSpawner = useNotificationSpawner();
    const [isEditMode, setIsEditMode] = useState(false);
    const [connectionData, setConnectionData] = useState<MnestixConnection[]>();
    const [connectionFormData, setConnectionFormData] = useState<MnestixConnection[]>();

    
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
        setConnectionData(await getConnectionData())
        if(rawConnectionData) {
            const defaultFormData: ConnectionFormData = {
                repositories: rawConnectionData?.map((data) => ({
                    id: data.id,
                    url: data.url,
                    type: data.type.typeName
                }))
            }
            return defaultFormData;
        }
        else {
            return {repositories: []};
        }
    }

    const {
        control,
        register,
        setValue,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ConnectionFormData>({defaultValues: async () => await mapFormData()})

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray<ConnectionFormData>({
        control,
        name: "repositories",
    });
    
    return (
        <Box sx={{p: 3, width: '100%'}}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <CardHeading
                    title={<FormattedMessage {...messages.mnestix.mnestixConnections} />}
                    subtitle={<FormattedMessage {...messages.mnestix.mnestixConnectionsExplanation} />}
                />
                <Box>
                    <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditMode(true)}><FormattedMessage {...messages.mnestix.mnestixConnectionsEditButton} /></Button>
                </Box>
            </Box>
            <Box mt={3}>
                <Typography variant="h3" color="primary" mb={2}>
                    <FormattedMessage {...messages.mnestix.menstixConnectionsRepositories} />
                </Typography>
                { fields.map((field, index) => 
                     <FormControl fullWidth variant="filled" key={field.id}>
                        <Box display="flex" flexDirection="row" mb={2} alignItems="center">
                            <Typography variant="h4" mr={4} width="160px"><FormattedMessage {...messages.mnestix.menstixConnectionsRepositoryLabel} /></Typography>
                            {isEditMode ? (
                                <Box display="flex" alignItems="center" width="100%">
                                    <Controller
                                        name={`repositories.${index}.url`}
                                        control={control}
                                        defaultValue={field.url}
                                        render={({ field}) => (
                                        <TextField
                                            {...field}
                                            label={<FormattedMessage {...messages.mnestix.menstixConnectionsRepositoryLabel} />}
                                            sx={{ flexGrow: 1, mr: 1 }}
                                            fullWidth={true}
                                            error={!!errors.repositories}
                                            helperText={!!errors.repositories}
                                        />
                                    )}/>
                                    <IconButton><RemoveCircleOutlineIcon onClick={() => remove(index)} /></IconButton>
                                </Box>
                            ) : (<Typography>{getValues(`repositories.${index}.url`)}</Typography>)}
                        </Box> 
                    </FormControl>
                )}
                <Box>
                    <Button variant="text" startIcon={<ControlPointIcon />} onClick={() => append({id: 'temp', type: 'AAS_REPOSITORY', url: ''})}>
                        <FormattedMessage {...messages.mnestix.mnestixConnectionsAddButton} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}