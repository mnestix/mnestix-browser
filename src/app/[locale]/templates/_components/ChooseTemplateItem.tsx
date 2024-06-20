import { Add, InfoOutlined } from '@mui/icons-material';
import { Box, BoxProps, Divider, styled, Tooltip, Typography } from '@mui/material';
import { IconCircleWrapper } from 'components/basics/IconCircleWrapper';

interface ChooseTemplateItemProps extends BoxProps {
    label: string;
    subLabel?: string;
    description?: string;
    hasDivider?: boolean;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export function ChooseTemplateItem(props: ChooseTemplateItemProps) {
    return (
        <Box>
            <StyledBox onClick={props.onClick}>
                <IconCircleWrapper sx={{ mr: 2 }}>
                    <Add color="primary" />
                </IconCircleWrapper>
                <Box>
                    <Typography variant="h4" color="primary">
                        {props.label}
                    </Typography>
                    {!!props.subLabel && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: '5px',
                                mr: props.description ? 2 : 0,
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                display: 'inline-block',
                            }}
                        >
                            {props.subLabel}
                        </Typography>
                    )}
                </Box>
                {!!props.description && (
                    <Tooltip
                        title={props.description}
                        onClick={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            e.stopPropagation();
                        }}
                    >
                        <InfoOutlined sx={{ color: 'text.secondary', ml: 'auto' }} />
                    </Tooltip>
                )}
            </StyledBox>
            {props.hasDivider !== false && <Divider />}
        </Box>
    );
}
