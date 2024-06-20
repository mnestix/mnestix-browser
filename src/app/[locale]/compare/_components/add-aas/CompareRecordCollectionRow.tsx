import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import { NestedContentWrapper } from 'components/basics/NestedContentWrapper';
import { messages } from 'lib/i18n/localization';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SubmodelCompareData } from 'lib/types/SubmodelCompareData';
import { useCompareAasContext } from 'components/contexts/CompareAasContext';
import { DataRow } from 'components/basics/DataRow';
import { isCompareData, isCompareDataRecord } from 'lib/util/CompareAasUtil';
import { CompareRecordValueRow } from './CompareRecordValueRow';

enum ExpandButtonText {
    show = 'show',
    hide = 'hide',
}

type SubmodelCompareDataComponentProps = {
    readonly submodelCompareData: SubmodelCompareData;
};

export function CompareRecordCollectionRow(props: SubmodelCompareDataComponentProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const componentList: ReactNode[] = [];
    const { submodelCompareData } = props;
    const { compareAas } = useCompareAasContext();

    const columnWidthCount = 12 / compareAas.length;

    if (
        !submodelCompareData.dataRecords ||
        (Array.isArray(submodelCompareData.dataRecords) && !submodelCompareData.dataRecords?.length) ||
        !Object.keys(submodelCompareData.dataRecords).length
    ) {
        return <></>;
    }
    submodelCompareData.dataRecords.forEach((val, dataIndex) => {
        if (isCompareDataRecord(val)) {
            componentList.push(
                <DataRow title={val.idShort} hasDivider={true} key={dataIndex}>
                    <CompareRecordValueRow data={val} columnWidthCount={columnWidthCount} />
                </DataRow>,
            );
        }
        if (isCompareData(val)) {
            return componentList.push(
                <DataRow title={val.idShort} hasDivider={true} key={dataIndex}>
                    <CompareRecordCollectionRow submodelCompareData={val} />{' '}
                </DataRow>,
            );
        }
        return <Grid item xs={columnWidthCount} key={dataIndex}></Grid>;
    });

    return (
        <Box>
            <Button
                size="small"
                variant="outlined"
                startIcon={isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                sx={{ my: 1 }}
                onClick={() => setIsExpanded(!isExpanded)}
                data-testid="submodel-dropdown-button"
            >
                <FormattedMessage
                    {...messages.mnestix.compareCollection[isExpanded ? ExpandButtonText.hide : ExpandButtonText.show]}
                    values={{
                        idShort: `${submodelCompareData.idShort ?? '-'}`,
                    }}
                />
            </Button>
            {isExpanded && <NestedContentWrapper>{componentList}</NestedContentWrapper>}
        </Box>
    );
}
