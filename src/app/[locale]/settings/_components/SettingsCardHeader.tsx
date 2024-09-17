import { CardHeading } from 'components/basics/CardHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { Box, Button } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type SettingsCardHeaderProps = {
    readonly onCancel: () => void;
    readonly onEdit: () => void;
    readonly onSubmit: () => void;
    readonly title: React.ReactNode;
    readonly subtitle: React.ReactNode;
    readonly isEditMode: boolean;
}

export function SettingsCardHeader(props: SettingsCardHeaderProps) {

    return (
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <CardHeading
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <Box display="flex" gap={2} alignContent="center" flexWrap="wrap">
                    {props.isEditMode ? (
                        <>
                            <Button variant="outlined" startIcon={<CloseIcon />} onClick={() => props.onCancel()}>
                                <FormattedMessage {...messages.mnestix.cancel} />
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckIcon />}
                                onClick={props.onSubmit}
                            >
                                <FormattedMessage {...messages.mnestix.connections.saveButton} />
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" startIcon={<EditIcon />} onClick={() => props.onEdit()}>
                            <FormattedMessage {...messages.mnestix.connections.editButton} />
                        </Button>
                    )}
                </Box>
            </Box>
    );
}
