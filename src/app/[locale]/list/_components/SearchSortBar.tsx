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

const itemHeight = 32;
const borderRadius = 25;

export const SearchSortBar: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');

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
            <FormControl variant="outlined" sx={{ minWidth: 120, ml: 2, borderRadius: borderRadius }}>
                <Select
                    displayEmpty
                    value={sortBy}
                    onChange={handleSortChange}
                    input={<OutlinedInput />}
                    sx={{
                        height: itemHeight,
                        borderRadius: borderRadius,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                    }}
                >
                    <MenuItem value="" disabled>
                        Sort by
                    </MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                </Select>
            </FormControl>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 2,
                    borderRadius: borderRadius,
                    border: '1px solid rgba(255, 255, 255, 0.23)',
                    padding: '4px 8px',
                    flexGrow: 1,
                    height: itemHeight,
                }}
            >
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.87)' }} />
                <InputBase
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{
                        ml: 1,
                        color: 'rgba(255, 255, 255, 0.87)',
                        '& .MuiInputBase-input': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
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
                    borderRadius: borderRadius,
                    border: '1px solid rgba(255, 255, 255, 0.23)',
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
