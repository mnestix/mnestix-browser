import { InfoOutlined } from '@mui/icons-material';
import { alpha, Box, Paper, Skeleton, Divider, Typography, styled } from '@mui/material';
import { CardHeading } from 'components/basics/CardHeading';
import { messages } from 'lib/i18n/localization';
import { Fragment, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { IdGenerationSettingFrontend } from 'lib/types/IdGenerationSettingFrontend';
import { IdSettingEntry } from './IdSettingEntry';
import { AssetIdRedirectDocumentationDialog } from './AssetIdRedirectDocumentationDialog';

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
    readonly handleChange: (idShort: string, values: { prefix: string; dynamicPart: string }) => void;
};
export function IdSettingsCard(props: IdSettingsCardProps) {
    const settings = props.idSettings || [];
    const [currentSettingInEditMode, setCurrentSettingInEditMode] = useState('');
    const [documentationModalOpen, setDocumentationModalOpen] = useState(false);

    // only allow one setting to be in edit mode
    function setEditMode(name: string, value: boolean) {
        if (value) {
            setCurrentSettingInEditMode(name);
        } else {
            setCurrentSettingInEditMode('');
        }
    }
    return (
        <Paper sx={{ p: 3, width: '100%' }}>
            <CardHeading
                title={<FormattedMessage {...messages.mnestix.idStructure} />}
                subtitle={<FormattedMessage {...messages.mnestix.idStructureExplanation} />}
            />
            <Box sx={{ my: 2 }}>
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
                {settings.map((setting, index) => {
                    return (
                        <IdSettingEntry
                            key={index}
                            idSetting={setting}
                            hasDivider={index !== 0}
                            handleChange={props.handleChange}
                            setEditMode={setEditMode}
                            editMode={currentSettingInEditMode === setting.name}
                            isLoading={props.isLoading}
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
        </Paper>
    );
}
