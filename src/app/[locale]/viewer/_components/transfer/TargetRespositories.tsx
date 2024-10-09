import { Box, Skeleton, TextField, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import {
    getConnectionDataByTypeAction
} from 'lib/services/database/MnestixConnectionServerActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Fragment, useState } from 'react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { ConnectionTypeEnum } from 'lib/services/database/ConnectionTypeEnum';

export function TargetRespositories() {
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [aasRepositories, setAasRepositories] = useState<string[]>([]);
    const [submodelRepositories, setSubmodelRepositories] = useState<string[]>([]);

    useAsyncEffect(async () => {
        try {
            setIsLoading(true);
            const aasRepositories = await getConnectionDataByTypeAction({ id: '0', typeName: ConnectionTypeEnum.AAS_REPOSITORY });
            setAasRepositories(aasRepositories);
            const submodelRepositories = await getConnectionDataByTypeAction({ id: '1', typeName: ConnectionTypeEnum.SUBMODEL_REPOSITORY });
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

    return(
        <>
            { isLoading ?
            [0, 1].map((i) => {
                return (
                    <Fragment key={i}>
                        <Skeleton variant="text" width="50%" height={26} sx={{ m: 2 }} />
                    </Fragment>
                );
            }) : 
            <Box display="flex" flexDirection="column">
                <Box display="flex" flexDirection="row" alignItems="center">
                    <Typography variant="h4" sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseRepository} /></Typography>
                    <TextField fullWidth select>{ aasRepositories.map((repo, index) => {
                       return <option key={index} value={repo}>{repo}</option>
                    })}
                    </TextField>
                </Box>
                <Box display="flex" flexDirection="row" mt={2} alignItems="center">
                    <Typography variant="h4" sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseSubmodelRepository} /></Typography>
                    <TextField fullWidth select>{ submodelRepositories.map((repo, index) => {
                        return <option key={index} value={repo}>{repo}</option>
                    })}</TextField>
                </Box>
            </Box> }
        </>
    )
}