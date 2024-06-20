import { InfoOutlined, Mediation, Numbers, TextSnippet, Visibility } from '@mui/icons-material';
import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';

type TemplateEditSectionHeadingProps = {
    readonly type: 'defaultValue' | 'displayName' | 'mappingInfo' | 'multiplicity';
};

export function TemplateEditSectionHeading(props: TemplateEditSectionHeadingProps) {
    const getIcon = () => {
        switch (props.type) {
            case 'displayName':
                return <Visibility fontSize="small" />;
            case 'mappingInfo':
                return <Mediation fontSize="small" />;
            case 'multiplicity':
                return <Numbers fontSize="small" />;
            case 'defaultValue':
            default:
                return <TextSnippet fontSize="small" />;
        }
    };

    const getTitle = () => {
        switch (props.type) {
            case 'displayName':
                return <FormattedMessage {...messages.mnestix.displayName} />;
            case 'mappingInfo':
                return <FormattedMessage {...messages.mnestix.mappingInfo} />;
            case 'defaultValue':
                return <FormattedMessage {...messages.mnestix.defaultValue} />;
            case 'multiplicity':
                return <FormattedMessage {...messages.mnestix.multiplicity} />;
            default:
                return <></>;
        }
    };

    const getDescription = () => {
        switch (props.type) {
            case 'mappingInfo':
                return <FormattedMessage {...messages.mnestix.mappingInfoDescription} />;
            case 'multiplicity':
                return <FormattedMessage {...messages.mnestix.multiplicityDescription} />;
            default:
                return;
        }
    };
    return (
        <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" alignItems="center" color="text.secondary" sx={{ mb: 1 }}>
                <Box display="flex" alignItems="center" sx={{ mr: '3px' }}>
                    {getIcon()}
                </Box>
                <Typography variant="body2">{getTitle()}</Typography>
                {getDescription() && (
                    <Tooltip title={getDescription() || <></>}>
                        <InfoOutlined sx={{ color: 'text.secondary', ml: '3px' }} fontSize="small" />
                    </Tooltip>
                )}
            </Box>
        </>
    );
}
