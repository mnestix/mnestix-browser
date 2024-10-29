import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { TimeSeriesLineDiagram } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesLineDiagram';
import {
    extractIntlValueBySemanticId,
    parseRecordsFromInternalSegment,
    TimeSeriesDataSet,
} from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesUtil';
import { SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { StyledDataRow } from 'components/basics/StyledDataRow';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';

export function InternalTimeSeries(props: { submodelElement: SubmodelElementCollection }) {
    const intl = useIntl();
    const [data, setData] = useState<TimeSeriesDataSet>({ names: [], points: [] });
    const [error, setError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const points = parseRecordsFromInternalSegment(props.submodelElement);

        if (!points) {
            setIsLoading(false);
            setError(true);
            return;
        }
        setData(points);
        setIsLoading(false);
    }, [props.submodelElement]);

    const name = extractIntlValueBySemanticId(
        props.submodelElement,
        SubmodelElementSemanticId.TimeSeriesSegmentName,
        intl,
    );

    const description = extractIntlValueBySemanticId(
        props.submodelElement,
        SubmodelElementSemanticId.TimeSeriesSegmentDescription,
        intl,
    );

    if (isLoading) return <CircularProgress />;

    if (error)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                <Alert icon={false} severity="warning">
                    {intl.formatMessage(messages.mnestix.errorMessages.influxError)}
                </Alert>
            </Box>
        );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }} data-testid="timeseries-internal-wrapper">
            <StyledDataRow title={name}>
                <Box sx={{ marginTop: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                    <Typography
                        sx={{ color: 'primary.main', fontSize: 24, fontWeight: 600, lineHeight: 1 }}
                        component="span"
                    >
                        {description}
                    </Typography>
                </Box>
                <Box sx={{ marginTop: 2 }}>
                    <TimeSeriesLineDiagram data={data} timeframeSelectable={true} />
                </Box>
            </StyledDataRow>
        </Box>
    );
}
