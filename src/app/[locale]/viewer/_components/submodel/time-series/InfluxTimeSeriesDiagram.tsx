import { FluxResultObserver, InfluxDB } from '@influxdata/influxdb-client-browser';
import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { TimeSeriesLineDiagram } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesLineDiagram';
import { TimeSeriesDataSet } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesUtil';

export function InfluxTimeSeriesDiagram(props: { query: string; endpoint: string }) {
    const intl = useIntl();
    const { query, endpoint } = props;
    const url = endpoint.split('/api/v2/query?org=')[0];
    const org = endpoint.split('/api/v2/query?org=')[1].split('?')[0];
    const [data, setData] = useState<TimeSeriesDataSet>({ points: [], names: [] });
    const [error, setError] = useState<Error | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const responseData: TimeSeriesDataSet = { points: [], names: ['y'] };

        const influx = new InfluxDB({
            url,
            headers: { ['Authorization']: 'Token tokentokentokentoken' },
        }).getQueryApi(org);
        const observer: FluxResultObserver<string[]> = {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                console.log('data: ' + data);
                responseData.points.push({ timestamp: o._time, y: o._value });
            },
            error(e) {
                setError(e);
                console.log('error ' + e);
                setIsLoading(false);
            },
            complete() {
                setData(responseData);
                setIsLoading(false);
            },
        };

        return influx.queryRows(query, observer);
    }, [org, url, query]);

    if (isLoading) return <CircularProgress />;

    if (error)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                <Alert icon={false} severity="warning">
                    {intl.formatMessage(messages.mnestix.errorMessages.influxError)}
                </Alert>
            </Box>
        );

    return <TimeSeriesLineDiagram data={data} />;
}
