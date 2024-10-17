import { FluxResultObserver, InfluxDB } from '@influxdata/influxdb-client-browser';
import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { TimeSeriesLineDiagram } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesLineDiagram';
import { dataPoint } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesUtil';


export function InfluxTimeSeriesDiagram(props: { query: string; endpoint: string }) {
    const intl = useIntl();
    const { query, endpoint } = props;
    const [url, org] = endpoint.split('/api/v2/query?org=');
    const [data, setData] = useState<dataPoint[]>([]);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const responseData: dataPoint[] = [];

        const influx = new InfluxDB({ url }).getQueryApi(org);
        const observer: FluxResultObserver<string[]> = {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                responseData.push({ timestamp: o._time, value: o._value });
            },
            error(e) {
                setError(e);
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

    return <TimeSeriesLineDiagram data={data}/>
}
