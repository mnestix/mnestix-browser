import {
    Brush,
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
import { Box, Typography } from '@mui/material';
import { DataSet } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesUtil';

function formatDate(dateString: string, onlyTime = false) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: onlyTime ? '2-digit' : undefined,
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
    return date.toISOString().split('T')[0];
}

function getUTCMidnightEquivalentTime(dates: string[]) {
    return dates.map((date) => {
        const dt = new Date(`${date}`);
        const utcTime = dt.getTime() + dt.getTimezoneOffset() * 60000;
        return new Date(utcTime).toISOString().slice(0, -5) + 'Z';
    });
}

export function TimeSeriesLineDiagram(props: { data: DataSet; timeframeSelectable?: boolean }) {
    const uniqueDates = [...new Set(props.data.points.map((point) => getDateStamp(point['timestamp'] as string)))];
    const startDayMarkerStamp = uniqueDates.length > 2 ? getUTCMidnightEquivalentTime(uniqueDates) : [];

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
                    <Typography>{formatDate(label, uniqueDates.length <= 2)}</Typography>
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
                <LineChart data={props.data.points} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v, uniqueDates.length <= 2)} />
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
                    {props.data.names.map((name, index) => (
                        <Line type="monotone" key={index} dataKey={name} stroke="#5e6b7c" />
                    ))}
                    {props.timeframeSelectable && (
                        <Brush
                            dataKey="timestamp"
                            height={30}
                            tickFormatter={(v) => formatDate(v, uniqueDates.length <= 2)}
                            stroke="#5e6b7c"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}
