import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box } from '@mui/material';
import { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import {
    getConnectionDataAction,
    upsertConnectionDataAction,
} from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionServerActions';
import {  useForm } from 'react-hook-form';
import { useEnv } from 'app/env/provider';
import { SettingsCardHeader } from 'app/[locale]/settings/_components/SettingsCardHeader';
import { MnestixConnectionsForm } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionForm';

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
            return { repositories: [] };
        }
    }

    const {
        control,
        handleSubmit,
        getValues,
        reset,
    } = useForm<ConnectionFormData>({ defaultValues: async () => await mapFormData() });

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
    
    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <SettingsCardHeader title={<FormattedMessage {...messages.mnestix.connections.title} />}
                                subtitle={<FormattedMessage {...messages.mnestix.connections.subtitle} />}
                                onCancel={() => cancelEdit()} onEdit={() => setIsEditMode(true)}
                                onSubmit={handleSubmit((data) => saveConnectionData(data))}
                                isEditMode={isEditMode}/>
            <MnestixConnectionsForm connectionType={'aasRepository'}
                                    defaultUrl={env.AAS_REPO_API_URL} 
                                    isLoading={isLoading} 
                                    isEditMode={isEditMode} 
                                    setIsEditMode={setIsEditMode} 
                                    control={control} 
                                    getValues={getValues}/>
            <MnestixConnectionsForm connectionType={'submodelRepository'}
                                    defaultUrl={env.AAS_REPO_API_URL}
                                    isLoading={isLoading}
                                    isEditMode={isEditMode}
                                    setIsEditMode={setIsEditMode}
                                    control={control}
                                    getValues={getValues}/>
        </Box>
    );
}
