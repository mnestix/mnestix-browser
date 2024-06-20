import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

export function TimeFrameSelection(props: {
    selectedTimeFrame: string;
    setSelectedTimeFrame: React.Dispatch<React.SetStateAction<string>>;
    selectableTimeFrames: string[];
}) {
    const { selectedTimeFrame, setSelectedTimeFrame, selectableTimeFrames } = props;

    const handleTimeChange = (_event: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (value) setSelectedTimeFrame(value);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexDirection: 'column',
            }}
        >
            <ToggleButtonGroup
                value={selectedTimeFrame}
                onChange={handleTimeChange}
                aria-label="outlined primary button group"
                exclusive
            >
                {selectableTimeFrames.map((value, index) => (
                    <ToggleButton key={index} value={value}>
                        {value}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}
