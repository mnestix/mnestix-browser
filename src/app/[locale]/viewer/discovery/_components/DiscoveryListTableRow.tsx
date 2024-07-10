import { TableCell } from '@mui/material';
import { IDiscoveryListEntry } from 'lib/types/DiscoveryListEntry';
import PictureTableCell from 'components/basics/listBasics/PictureTableCell';
import { useAasState } from 'components/contexts/CurrentAasContext';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useRouter } from 'next/navigation';

type DiscoveryListTableRowProps = {
    aasListEntry: IDiscoveryListEntry;
};

const tableBodyText = {
    lineHeight: '150%',
    fontSize: '16px',
    color: 'text.primary',
};
export const DiscoveryListTableRow = (props: DiscoveryListTableRowProps) => {
    const { aasListEntry } = props;
    const [, setAas] = useAasState();
    const navigate = useRouter();

    const navigateToAas = (aasId: string) => {
        setAas(null);
        navigate.push(`/viewer/${encodeBase64(aasId)}`);
    };

    return (
        <>
            <PictureTableCell onClickAction={() => navigateToAas(aasListEntry.aasId)} />
            <TableCell align="left" sx={tableBodyText}>
                {aasListEntry.aasId}
            </TableCell>
            <TableCell align="left" sx={tableBodyText}>
                {aasListEntry.repositoryUrl}
            </TableCell>
        </>
    );
};
