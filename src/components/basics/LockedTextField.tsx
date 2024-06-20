import { Lock } from '@mui/icons-material';
import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';

function _LockedTextField(props: TextFieldProps, ref: ForwardedRef<HTMLDivElement>) {
    return (
        <TextField
            disabled
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <Lock fontSize="small" style={{ opacity: 0.5 }} />
                    </InputAdornment>
                ),
            }}
            ref={ref}
            {...props}
        />
    );
}

export const LockedTextField = forwardRef(_LockedTextField);
