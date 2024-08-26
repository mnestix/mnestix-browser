'use client';

import { PrivateRoute } from 'components/azureAuthentication/PrivateRoute';
import { Box, Card } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ViewHeading } from 'components/basics/ViewHeading';
import { TabSelectorItem, VerticalTabSelector } from 'components/basics/VerticalTabSelector';
import { messages } from 'lib/i18n/localization';
import { useState } from 'react';
import { IdGenerationSettingFrontend } from 'lib/types/IdGenerationSettingFrontend';
import { getArrayFromString } from 'lib/util/SubmodelResolverUtil';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import {
    ISubmodelElement,
    Property,
    Qualifier,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useAuth } from 'lib/hooks/UseAuth';
import { IdSettingsCard } from './_components/id-settings/IdSettingsCard';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { MnestixConnectionsCard } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionsCard';

enum settingsPageTypes {
    ID_STRUCTURE,
    MNESTIX_CONNECTIONS
}

export default function Page() {
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const [settings, setSettings] = useState<IdGenerationSettingFrontend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useIsMobile();

    const settingsTabItems: TabSelectorItem[] = [
        {
            id: settingsPageTypes[settingsPageTypes.ID_STRUCTURE],
            label: intl.formatMessage(messages.mnestix.idStructure)
        },
        {
            id: settingsPageTypes[settingsPageTypes.MNESTIX_CONNECTIONS],
            label: intl.formatMessage(messages.mnestix.mnestixConnections)
        }]
    const [selectedTab, setSelectedTab] = useState<TabSelectorItem>(settingsTabItems[0]);

    const auth = useAuth();
    const bearerToken = auth.getBearerToken();
    const {configurationClient} = useApis();

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await configurationClient.getIdGenerationSettings();
            const _settings: IdGenerationSettingFrontend[] = [];
            // set settings from api response
            res.submodelElements?.forEach((el) => {
                const element = el as ISubmodelElement;
                const collection = el as SubmodelElementCollection;
                const _settingsList = collection.value;
                const name = el.idShort;

                // IdType (to apply correct validation)
                const idTypeQualifier = element.qualifiers?.find((q: Qualifier) => {
                    return q.type === 'SMT/IdType';
                });
                const idType = idTypeQualifier?.value;

                const prefix = _settingsList?.find((e) => e.idShort === 'Prefix') as Property;
                const dynamicPart = _settingsList?.find((e) => e.idShort === 'DynamicPart') as Property;

                const dynamicPartAllowedQualifier = dynamicPart?.qualifiers?.find((q: Qualifier) => {
                    return q.type === 'AllowedValue';
                });
                const allowedDynamicPartValues = getArrayFromString(dynamicPartAllowedQualifier?.value || '');

                const prefixExampleValueQualifier = prefix?.qualifiers?.find((q: Qualifier) => {
                    return q.type === 'ExampleValue';
                });
                const prefixExampleValue = prefixExampleValueQualifier?.value;

                _settings.push({
                    name: name || '',
                    idType,
                    prefix: {
                        value: prefix?.value,
                        exampleValue: prefixExampleValue,
                    },
                    dynamicPart: {
                        value: dynamicPart?.value,
                        allowedValues: allowedDynamicPartValues,
                        // (we do not fill example value from api currently)
                    },
                });
            });
            setSettings(_settings);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoading(false);
        }
    };

    async function handleChangeIdGeneratorSetting(idShort: string, values: { prefix: string; dynamicPart: string }) {
        try {
            setIsLoading(true);
            await configurationClient.putSingleIdGenerationSetting(idShort, bearerToken, values);
            await fetchSettings();
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.successfullyUpdated),
                severity: 'success',
            });
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch settings initially
    useAsyncEffect(async () => {
        await fetchSettings();
    }, [bearerToken]);


    const renderActiveSettingsTab = () => {
        switch (selectedTab.id) {
            case settingsPageTypes[settingsPageTypes.ID_STRUCTURE]:
                return <IdSettingsCard
                    idSettings={settings}
                    isLoading={isLoading}
                    handleChange={handleChangeIdGeneratorSetting}
                />
            case settingsPageTypes[settingsPageTypes.MNESTIX_CONNECTIONS]:
                return <MnestixConnectionsCard/>
            default:
                return <></>
        }
    }

    return (
        <PrivateRoute>
            <Box sx={{p:4, width: '100%', margin: '0 auto'}}>
                <Box sx={{mb: 3}}>
                    <ViewHeading title={<FormattedMessage {...messages.mnestix.settings} />}/>
                </Box>
                <Card sx={{p: 2}}>
                    <Box display="grid" gridTemplateColumns={isMobile ? '1fr' : '1fr 3fr'}>
                        <VerticalTabSelector items={settingsTabItems} selected={selectedTab}
                                             setSelected={setSelectedTab}/>
                        {renderActiveSettingsTab()}
                    </Box>
                </Card>
                <Box>
                    <p>{}</p>
                </Box>
            </Box>
        </PrivateRoute>
    );
}
