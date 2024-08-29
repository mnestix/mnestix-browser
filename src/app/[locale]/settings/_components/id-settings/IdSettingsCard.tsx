import { InfoOutlined } from '@mui/icons-material';
import { alpha, Box, Skeleton, Divider, Typography, styled, Button } from '@mui/material';
import { CardHeading } from 'components/basics/CardHeading';
import { messages } from 'lib/i18n/localization';
import { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { IdGenerationSettingFrontend } from 'lib/types/IdGenerationSettingFrontend';
import { IdSettingEntry } from './IdSettingEntry';
import { AssetIdRedirectDocumentationDialog } from './AssetIdRedirectDocumentationDialog';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { ConnectionFormData } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionsCard';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';

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

type IdSettingsCardProps = {
    readonly idSettings: IdGenerationSettingFrontend[] | undefined;
    readonly isLoading?: boolean;
    readonly handleChange: (idShort: string, values: { prefix: string; dynamicPart: string }) => Promise<void>;
};

export type IdSettingsFormData = {
    idSettings: IdGenerationSettingFrontend[];
}

export function IdSettingsCard(props: IdSettingsCardProps) {
    const settings = props.idSettings || [];
    const [isEditMode, setIsEditMode] = useState(false);
    const [documentationModalOpen, setDocumentationModalOpen] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IdSettingsFormData>({defaultValues: {idSettings: settings} });
    
    useEffect(() => {
        reset({idSettings: settings})
    }, [props.isLoading])

    const { fields } = useFieldArray<IdSettingsFormData>({
        control,
        name: 'idSettings',
    });
    
    async function saveIdSettings(data: IdSettingsFormData) {
        for (const setting of data.idSettings) {
            if(setting.prefix.value && setting.dynamicPart.value) {
                await props.handleChange(setting.name, {prefix: setting.prefix.value, dynamicPart: setting.dynamicPart.value})
            }
        }
        setIsEditMode(false); // todo move save/load to card and extract form in extra component
    }

    const cancelEdit = () => {
        reset();
        setIsEditMode(false);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <CardHeading
                    title={<FormattedMessage {...messages.mnestix.idStructure} />}
                    subtitle={<FormattedMessage {...messages.mnestix.idStructureExplanation} />}
                />
                <Box display="flex" gap={2} alignContent="center" flexWrap="wrap">
                    {isEditMode ? (
                        <>
                            <Button variant="outlined" startIcon={<CloseIcon />} onClick={()=> {cancelEdit()}}>
                                <FormattedMessage {...messages.mnestix.cancel} />
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckIcon />}
                                onClick={handleSubmit((data) => saveIdSettings(data))}
                            >
                                <FormattedMessage {...messages.mnestix.connections.saveButton} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditMode(true)}>
                            <FormattedMessage {...messages.mnestix.connections.editButton} />
                        </Button>
                    )}
                </Box>
            </Box>
            <Box sx={{ my: 2 }}>
                <Divider />
                {props.isLoading &&
                    !settings.length &&
                    [0, 1, 2, 3, 4].map((i) => {
                        return (
                            <Fragment key={i}>
                                <Skeleton variant="text" width="50%" height={26} sx={{ m: 2 }} />
                                {i < 4 && <Divider />}
                            </Fragment>
                        );
                    })}
                {fields.map((field, index) => {
                    return (
                        <IdSettingEntry
                            key={index}
                            index={index}
                            field={field}
                            handleChange={props.handleChange}
                            editMode={isEditMode}
                            isLoading={props.isLoading}
                            control={control}
                            register={register}
                            errors={errors}
                        />
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex' }}>
                <StyledDocumentationButton onClick={() => setDocumentationModalOpen(true)}>
                    <InfoOutlined sx={{ mr: 1 }} />
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
