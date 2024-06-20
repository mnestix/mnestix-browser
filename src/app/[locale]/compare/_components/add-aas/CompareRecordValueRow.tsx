import { SubmodelCompareDataRecord } from 'lib/types/SubmodelCompareData';
import { useIntl } from 'react-intl';
import { compareRowValues } from 'lib/util/CompareAasUtil';
import { Grid } from '@mui/material';
import { CompareSubmodelElement } from '../CompareSubmodelElement';
import { DifferenceSymbol } from 'components/basics/DifferenceSymbol';

export function CompareRecordValueRow(props: { data: SubmodelCompareDataRecord; columnWidthCount: number }) {
    const dataRecord = props.data;
    const intl = useIntl();

    const markedIndexes = compareRowValues(dataRecord.submodelElements, intl);

    return (
        <Grid container data-testid={'compare-Record'} justifyContent="space-between" alignItems="center">
            {(dataRecord as SubmodelCompareDataRecord).submodelElements?.map((subElement, valueIndex) => {
                return (
                    <Grid
                        item
                        xs={props.columnWidthCount - 0.5}
                        key={valueIndex}
                        data-testid={`compare-value-${valueIndex}`}
                    >
                        {subElement ? (
                            <CompareSubmodelElement
                                submodelElement={subElement}
                                isMarked={markedIndexes.includes(valueIndex)}
                            />
                        ) : (
                            markedIndexes.includes(valueIndex) && <DifferenceSymbol />
                        )}
                    </Grid>
                );
            })}
        </Grid>
    );
}
