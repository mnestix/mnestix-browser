import { FluxResultObserver, InfluxDB } from '@influxdata/influxdb-client-browser';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Label,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';

type dataPoint = {
    timestamp: string;
    value: number;
};

function formatDate(dateString: string, showSeconds = false) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
    });
}

function formatDateLabel(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
    });
}

function getDateStamp(dateString: string) {
    const date = new Date(dateString);
    const dateStamp = date.toISOString().split('T')[0];
    return dateStamp;
}

function getUTCMidnightEquivalentTime(dates: string[]) {
    const utcMidnights = dates.map((date) => {
        const dt = new Date(`${date}`);
        const utcTime = dt.getTime() + dt.getTimezoneOffset() * 60000;
        const utcMidnight = new Date(utcTime).toISOString().slice(0, -5) + 'Z';
        return utcMidnight;
    });
    return utcMidnights;
}

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

    const uniqueDates = [...new Set(data.map((date) => getDateStamp(date.timestamp)))];

    const startDayMarkerStamp = getUTCMidnightEquivalentTime(uniqueDates);

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: Array<{ color: string; name: string; value: string }>;
        label?: string;
    }) => {
        if (payload && payload.length && label) {
            return (
                <Box
                    sx={{
                        bgcolor: 'white',
                        border: '1px solid #CCCCCC',
                        visibility: !active ? 'hidden' : undefined,
                        padding: '10px',
                    }}
                >
                    <Typography>{formatDate(label, true)}</Typography>
                    {payload.map((p, index) => (
                        <Box key={index} sx={{ color: p.color, paddingY: '4px' }}>{`${p.name} : ${p.value} `}</Box>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <Box sx={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v)} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    {startDayMarkerStamp.map((marker) => (
                        <ReferenceLine key={marker} x={marker} stroke="blue" isFront>
                            <Label
                                value={formatDateLabel(marker)}
                                position="insideRight"
                                dx={-5}
                                angle={-90}
                                style={{ textAnchor: 'middle' }}
                            />
                        </ReferenceLine>
                    ))}
                    <Line type="monotone" dataKey="value" stroke="#5e6b7c" />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}
