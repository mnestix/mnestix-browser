import { InfoOutlined } from '@mui/icons-material';
import { alpha, Box, Skeleton, Divider, Typography, styled } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { Fragment, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { IdGenerationSettingFrontend } from 'lib/types/IdGenerationSettingFrontend';
import { IdSettingEntry } from './IdSettingEntry';
import { AssetIdRedirectDocumentationDialog } from './AssetIdRedirectDocumentationDialog';
import { useFieldArray, useForm } from 'react-hook-form';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { showError } from 'lib/util/ErrorHandlerUtil';
import {
    ISubmodelElement, Property,
    Qualifier,
    SubmodelElementCollection
} from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { getArrayFromString } from 'lib/util/SubmodelResolverUtil';
import { useAuth } from 'lib/hooks/UseAuth';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { SettingsCardHeader } from 'app/[locale]/settings/_components/SettingsCardHeader';

const StyledDocumentationButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all .3s',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),

    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
}));

export type IdSettingsFormData = {
    idSettings: IdGenerationSettingFrontend[];
}

export function IdSettingsCard() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [documentationModalOpen, setDocumentationModalOpen] = useState(false);
    const auth = useAuth();
    const bearerToken = auth.getBearerToken();
    const { configurationClient } = useApis();
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<IdGenerationSettingFrontend[]>([]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IdSettingsFormData>({ defaultValues: { idSettings: settings } });

    const { fields } = useFieldArray<IdSettingsFormData>({
        control,
        name: 'idSettings',
    });
    
    // Fetch id settings initially
    useAsyncEffect(async () => {
        await fetchIdSettings();
    }, [bearerToken]);

    const fetchIdSettings = async () => {
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
                    return q.type === 'SMT/AllowedValue';
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
            // set form state
            reset({ idSettings: _settings })

        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoading(false);
        }
    };
    
    async function saveIdSettings(data: IdSettingsFormData) {
        try {
            setIsLoading(true);
            for (const setting of data.idSettings) {
                if (setting.prefix.value && setting.dynamicPart.value) {
                    await configurationClient.putSingleIdGenerationSetting(setting.name, bearerToken, {
                        prefix: setting.prefix.value,
                        dynamicPart: setting.dynamicPart.value
                    })
                }
            }
            await fetchIdSettings();
            notificationSpawner.spawn({
                message: intl.formatMessage(messages.mnestix.successfullyUpdated),
                severity: 'success',
            });
            setIsEditMode(false);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoading(false);
        }
    }

    const cancelEdit = () => {
        reset();
        setIsEditMode(false);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <SettingsCardHeader title={<FormattedMessage {...messages.mnestix.idStructure} />}
                                subtitle={<FormattedMessage {...messages.mnestix.idStructureExplanation} />}
                                onCancel={() => cancelEdit()} onEdit={() => setIsEditMode(true)}
                                onSubmit={handleSubmit((data) => saveIdSettings(data))}
                                isEditMode={isEditMode}/>
            <Box sx={{ my: 2 }}>
                <Divider/>
                {isLoading &&
                    !settings.length &&
                    [0, 1, 2, 3, 4].map((i) => {
                        return (
                            <Fragment key={i}>
                                <Skeleton variant="text" width="50%" height={26} sx={{ m: 2 }}/>
                            </Fragment>
                        );
                    })}
                {fields.map((field, index) => {
                    return (
                        <IdSettingEntry
                            key={index}
                            index={index}
                            field={field}
                            editMode={isEditMode}
                            isLoading={isLoading}
                            control={control}
                            errors={errors}
                            register={register}
                        />
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex' }}>
                <StyledDocumentationButton onClick={() => setDocumentationModalOpen(true)}>
                    <InfoOutlined sx={{ mr: 1 }}/>
                    <Typography>
                        <FormattedMessage {...messages.mnestix.assetIdDocumentation.title} />
                    </Typography>
                </StyledDocumentationButton>
            </Box>
            <AssetIdRedirectDocumentationDialog
                open={documentationModalOpen}
                onClose={() => setDocumentationModalOpen(false)}
            />
        </Box>
    );
}
