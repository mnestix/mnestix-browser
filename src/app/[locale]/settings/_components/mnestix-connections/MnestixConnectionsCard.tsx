import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, FormControl, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { MnestixConnection } from '.prisma/client';
import {
    getConnectionDataAction
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';

export function MnestixConnectionsCard() {
    const notificationSpawner = useNotificationSpawner();
    const [isEditMode, setIsEditMode] = useState(false);
    const [connectionData, setConnectionData] = useState<MnestixConnection[]>();

    async function getConnectionData() {
        try {
            const data = await getConnectionDataAction();
            console.log(data)
            return data
        } catch (error) {
            notificationSpawner.spawn(error);
        }
        return
    }

    useAsyncEffect(async () => {
        setConnectionData(await getConnectionData())
    }, []);

    return (
        <Box sx={{p: 3, width: '100%'}}>
            <CardHeading
                title={<FormattedMessage {...messages.mnestix.mnestixConnections} />}
                subtitle={<FormattedMessage {...messages.mnestix.mnestixConnectionsExplanation} />}
            />
            <Box mt={2}>
                <Typography variant="h3" color="primary">
                    <FormattedMessage {...messages.mnestix.menstixConnectionsRepositories} />
                </Typography>
                {(connectionData && connectionData.length > 0) && connectionData.map(data => {
                    return <FormControl fullWidth variant="filled" key={data.id}>
                        <Box display="flex" mt={1}>
                            <Typography>{data.url}</Typography>
                        </Box>
                    </FormControl>
                })}
            </Box>
        </Box>
    );
}