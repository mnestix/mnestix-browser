import { Dialog, DialogContent, Typography } from '@mui/material';
import { Entity } from '@aas-core-works/aas-core3.0-typescript/types';
import { DataRow } from 'components/basics/DataRow';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';

type EntityDetailsModalProps = {
    readonly entity: Entity;
    readonly handleClose: () => void;
    readonly open: boolean;
};

export function EntityDetailsDialog(props: EntityDetailsModalProps) {
    const entity = props.entity;

    return (
        <Dialog open={props.open} onClose={props.handleClose}>
            <DialogContent data-testid="bom-info-popup">
                <Typography variant="h3" sx={{ mb: 2 }}>
                    {entity.idShort}
                </Typography>
                <DataRow title="idShort" hasDivider={false}>
                    {entity.idShort}
                </DataRow>
                <DataRow title="asset">
                    {entity.globalAssetId || <FormattedMessage {...messages.mnestix.notAvailable} />}
                </DataRow>
                <DataRow title="entityType">
                    {entity.entityType || <FormattedMessage {...messages.mnestix.notAvailable} />}
                </DataRow>
            </DialogContent>
        </Dialog>
    );
}
