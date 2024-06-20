import { Box, Divider, Link, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';
import { OpenInNew } from '@mui/icons-material';

type DataRowProps = {
    readonly title?: string | null;
    readonly value?: string;
    readonly children?: React.ReactNode;
    readonly hasDivider?: boolean;
    readonly isLink?: boolean;
    readonly sx?: SxProps<Theme>;
};

export function DataRow(props: DataRowProps) {
    return (
        <Box
            data-testid="data-row"
            sx={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px', ...props.sx }}
        >
            {props.hasDivider !== false && <Divider style={{ marginBottom: '10px' }} />}
            {props.title && (
                <Typography noWrap color="text.secondary" variant="body2" data-testid="data-row-title">
                    {props.title}
                </Typography>
            )}
            {props.value && (
                <Typography
                    style={{ overflowWrap: 'break-word', wordBreak: 'break-word', display: 'inline-block' }}
                    data-testid="data-row-value"
                >
                    {props.isLink ? (
                        <Link component="a" href={props.value} target="_blank" rel="noopener noreferrer">
                            {props.value}
                            <OpenInNew fontSize="small" sx={{ verticalAlign: 'middle', ml: 1 }} />
                        </Link>
                    ) : (
                        props.value
                    )}
                </Typography>
            )}
            <Box style={{ overflowWrap: 'break-word', wordBreak: 'break-word', display: 'inline-block' }}>
                {props.children}
            </Box>
        </Box>
    );
}
