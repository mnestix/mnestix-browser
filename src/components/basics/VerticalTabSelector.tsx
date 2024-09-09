import { alpha, Box, Button, styled, SvgIconProps, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { ReactElement } from 'react';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TabSelectorItem = {
    readonly id: string;
    readonly label: string;
    readonly startIcon?: ReactElement<SvgIconProps>;
    readonly submodelData?: Submodel;
};

type VerticalTabSelectorProps = {
    readonly items: TabSelectorItem[];
    readonly selected?: TabSelectorItem;
    readonly setSelected?: (selected: TabSelectorItem) => void;
};

const Tab = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    height: '60px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderColor: theme.palette.divider,
    transition: 'border-color 0s',
    borderRadius: '0',
    padding: '20px',
    '&.selected': {
        background: alpha(theme.palette.primary.main, 0.1),
        borderColor: 'transparent',
        fontWeight: '500',
        color: theme.palette.primary.main,
        '& + .tab-item': {
            borderColor: 'transparent',
        },
    },
    '&:hover': {
        background: theme.palette.grey['100'],
        cursor: 'pointer',
    },
    '&:active': {
        borderColor: 'transparent',
    },
}));

export function VerticalTabSelector(props: VerticalTabSelectorProps) {
    const selectedCSSClass = (id: string) => (id === props.selected?.id ? 'selected' : '');

    return (
        <Box sx={{ 'Button:nth-of-type(1)': { borderColor: 'transparent' } }}>
            {props.items.map((item, index) => {
                return (
                    <Tab
                        data-testid="submodel-tab"
                        key={index}
                        onClick={() => props.setSelected && props.setSelected(item)}
                        className={`tab-item ${selectedCSSClass(item.id)}`}
                    >
                        {item.startIcon ? (
                            <Box display="flex" alignItems="center">
                                <Box display="flex" alignItems="center" sx={{ mr: 1 }}>
                                    {item.startIcon}
                                </Box>
                                <Typography>{item.label || ''}</Typography>
                            </Box>
                        ) : (
                            <Typography>{item.label || ''}</Typography>
                        )}
                        <ArrowForward color="primary" />
                    </Tab>
                );
            })}
        </Box>
    );
}
