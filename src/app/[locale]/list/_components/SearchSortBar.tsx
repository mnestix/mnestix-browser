'use client';
import React, { useState, ChangeEvent, MouseEvent } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    InputBase,
    Select,
    FormControl,
    Box,
    SelectChangeEvent,
    OutlinedInput,
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

const itemHeight = 32;

export const SearchSortBar: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const theme = useTheme();

    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value as string);
    };

    return (
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" sx={{ minWidth: 120, ml: 2, borderRadius: theme.shape.borderRadius }}>
                <Select
                    displayEmpty
                    value={sortBy}
                    onChange={handleSortChange}
                    input={<OutlinedInput />}
                    sx={{
                        height: itemHeight,
                        borderRadius: theme.shape.borderRadius,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.divider,
                        },
                    }}
                >
                    <MenuItem value="" disabled>
                        Sort by
                    </MenuItem>
                    <MenuItem value="name">Module Type</MenuItem>
                    <MenuItem value="price">Connected</MenuItem>
                    <MenuItem value="status">Disconnected</MenuItem>
                    <MenuItem value="status">Protocol</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="status">Device Name A-Z</MenuItem>
                    <MenuItem value="status">Device Name Z-A</MenuItem>
                </Select>
            </FormControl>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 2,
                    borderRadius: theme.shape.borderRadius,
                    border: `1px solid ${theme.palette.divider}`,
                    padding: '4px 8px',
                    flexGrow: 1,
                    height: itemHeight,
                }}
            >
                <SearchIcon sx={{ color: theme.palette.text.primary }} />
                <InputBase
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{
                        ml: 1,
                        color: theme.palette.text.primary,
                        '& .MuiInputBase-input': {
                            borderColor: theme.palette.divider,
                        },
                        flexGrow: 1,
                    }}
                />
            </Box>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{
                    ml: 2,
                    borderRadius: theme.shape.borderRadius,
                    border: `1px solid ${theme.palette.divider}`,
                    padding: '8px',
                    height: itemHeight,
                }}
            >
                <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>Id</MenuItem>
                <MenuItem onClick={handleMenuClose}>Name</MenuItem>
            </Menu>
        </Toolbar>
    );
};
