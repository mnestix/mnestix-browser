import { Dialog, DialogContent } from '@mui/material';
import { ISubmodelElement, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';

type ArchetypeDetailsModalProps = {
    readonly handleClose: () => void;
    readonly open: boolean;
};

export function ArchetypeDetailsDialog(props: ArchetypeDetailsModalProps) {

    // TODO show image
    return (
        <Dialog open={props.open} onClose={props.handleClose} fullWidth maxWidth="md">
            <DialogContent>
             
            </DialogContent>
        </Dialog>
    );
}
