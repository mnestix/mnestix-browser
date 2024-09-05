import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { IDiscoveryListEntry } from 'lib/types/DiscoveryListEntry';
import { DiscoveryListTableRow } from 'app/[locale]/viewer/discovery/_components/DiscoveryListTableRow';

type AasListProps = {
    data?: IDiscoveryListEntry[];
    tableHeaders: { label: string }[];
};

export default function DiscoveryList(props: AasListProps) {
    const { data, tableHeaders } = props;
    const theme = useTheme();

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow
                        sx={{
                            color: 'primary',
                            lineHeight: '150%',
                            letterSpacing: '0.16px',
                            fontSize: '16px',
                        }}
                    >
                        {!!tableHeaders &&
                            tableHeaders.map((header: { label: string }, index) => (
                                <TableCell key={index}>
                                    <Typography fontWeight="bold">{header.label}</Typography>
                                </TableCell>
                            ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((aasListEntry, index) => (
                        <TableRow
                            key={index}
                            sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                backgroundColor: theme.palette?.common?.white,
                                '&:hover': { backgroundColor: theme.palette.action.hover },
                            }}
                            data-testid={`list-row-${aasListEntry.aasId}`}
                        >
                            <DiscoveryListTableRow aasListEntry={aasListEntry} />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
