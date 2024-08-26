import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, Button, FormControl, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { MnestixConnection } from '.prisma/client';
import {
    getConnectionDataAction
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useFieldArray, useForm } from 'react-hook-form';

type ConnectionFormData = {
    repositories: {
        url: string
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

    useAsyncEffect(async () => {
        setConnectionData(await getConnectionData())
    }, []);

    const {
        control,
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<ConnectionFormData>()

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray<ConnectionFormData>({
        control,
        name: "repositories",
    });
    
    return (
        <Box sx={{p: 3, width: '100%'}}>
            <CardHeading
                title={<FormattedMessage {...messages.mnestix.mnestixConnections} />}
                subtitle={<FormattedMessage {...messages.mnestix.mnestixConnectionsExplanation} />}
            />
            <Box mt={3}>
                <Typography variant="h3" color="primary" mb={2}>
                    <FormattedMessage {...messages.mnestix.menstixConnectionsRepositories} />
                </Typography>
                {(connectionData && connectionData.length > 0) && connectionData.map(data => {
                    return <FormControl fullWidth variant="filled" key={data.id}>
                        <Box display="flex" flexDirection="row" mb={2}>
                            <Typography variant="h4" mr={4}><FormattedMessage {...messages.mnestix.menstixConnectionsRepositoryLabel} /></Typography>
                            <Typography>{data.url}</Typography>
                        </Box> 
                    </FormControl>
                })}
                <Box>
                    <Button variant="text" startIcon={<ControlPointIcon />}><FormattedMessage {...messages.mnestix.mnestixConnectionsAddButton} /></Button>
                </Box>
            </Box>
        </Box>
    );
}