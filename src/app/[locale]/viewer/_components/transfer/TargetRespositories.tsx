import { Box, Button, DialogActions, Divider, Skeleton, TextField, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import {
    getConnectionDataByTypeAction
} from 'lib/services/database/MnestixConnectionServerActions';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Fragment, useEffect, useState } from 'react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { ConnectionTypeEnum } from 'lib/services/database/ConnectionTypeEnum';

export type TargetRepositoryFormData = {
    repository?: string;
    submodelRepository?: string;
}

type TargetRepositoryProps = {
    onSubmitStep: (values: TargetRepositoryFormData) => void;
}

export function TargetRespositories(props: TargetRepositoryProps) {
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [aasRepositories, setAasRepositories] = useState<string[]>([]);
    const [submodelRepositories, setSubmodelRepositories] = useState<string[]>([]);
    
    const [selectedRepository, setSelectedRepository] = useState<string>();
    const [selectedSubmodelRepository, setSelectedSubmodelRepository] = useState<string>();

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
                <form>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Typography variant="h4" sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseRepository} /></Typography>
                        <TextField fullWidth select required onChange={(e) =>setSelectedRepository(e.target.value)}>{ aasRepositories.map((repo, index) => {
                           return <option key={index} value={repo}>{repo}</option>
                        })}
                        </TextField>
                    </Box>
                    <Box display="flex" flexDirection="row" mt={2} alignItems="center">
                        <Typography variant="h4" sx={{ minWidth:'200px' }}><FormattedMessage {...messages.mnestix.transfer.chooseSubmodelRepository} /></Typography>
                        <TextField fullWidth select onChange={(e) => setSelectedSubmodelRepository(e.target.value)}>{ submodelRepositories.map((repo, index) => {
                            return <option key={index} value={repo}>{repo}</option>
                        })}
                        </TextField>
                    </Box>
                </form>
                <Divider sx={{ mt: 4, mb: 2 }}/>
                <DialogActions>
                    <Button variant="outlined" onClick={() => props.onSubmitStep({ repository: selectedRepository, submodelRepository: selectedSubmodelRepository })}>Save & Back to Previous Aas</Button>
                    <Button variant="contained" onClick={() => props.onSubmitStep({ repository: selectedRepository, submodelRepository: selectedSubmodelRepository })}>Save & Go to new Aas</Button>
                </DialogActions>
            </Box> 
            }
        </>
    )
}