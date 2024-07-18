'use client';
import { Paper, TableCell } from '@mui/material';
import { ShellIcon } from 'components/custom-icons/ShellIcon';

type PictureTableCellProps = {
    children?: React.ReactNode;
    onClickAction: () => void;
    title?: string;
};

const tableBodyText = {
    lineHeight: '150%',
    fontSize: '16px',
    color: 'text.primary',
};
export default function PictureTableCell(props: PictureTableCellProps) {
    const { children, onClickAction, title } = props;

    return (
        <TableCell component="th" scope="row" sx={tableBodyText}>
            <Paper
                onClick={onClickAction}
                sx={{
                    width: '88px',
                    height: '88px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        boxShadow: 6,
                        cursor: 'pointer',
                    },
                }}
                data-testid="list-thumbnail"
                title={title ?? undefined}
            >
                {children || <ShellIcon fontSize="large" color="primary" />}
            </Paper>
        </TableCell>
    );
}
