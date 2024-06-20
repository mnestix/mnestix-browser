import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataRow } from 'components/basics/DataRow';
import { useCompareAasContext } from 'components/contexts/CompareAasContext';
import { CompareRecordCollectionRow } from './add-aas/CompareRecordCollectionRow';
import { isCompareDataRecord } from 'lib/util/CompareAasUtil';
import { CompareRecordValueRow } from './add-aas/CompareRecordValueRow';

export function CompareSubmodelsAccordion() {
    const { compareAas, compareData } = useCompareAasContext();

    const columnWidthCount = 12 / compareAas.length;

    return (
        <Card>
            <CardContent>
                {compareData.map((data, index) => (
                    <Accordion
                        disableGutters
                        key={index}
                        style={{ boxShadow: 'none' }}
                        data-testid={`compare-Data-${index}`}
                    >
                        <AccordionSummary expandIcon={<ArrowDropDownIcon sx={{ color: 'grey.600' }} />}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#124B4F' }}>
                                {data.idShort}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {data.dataRecords ? (
                                data.dataRecords.map((val, dataIndex) => {
                                    return (
                                        <DataRow title={val.idShort} hasDivider={true} key={dataIndex}>
                                            {isCompareDataRecord(val) ? (
                                                <CompareRecordValueRow data={val} columnWidthCount={columnWidthCount} />
                                            ) : (
                                                <CompareRecordCollectionRow submodelCompareData={val} />
                                            )}
                                        </DataRow>
                                    );
                                })
                            ) : (
                                <></>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );
}
