import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { messages } from 'lib/i18n/localization';
import CloseIcon from '@mui/icons-material/Close';
import { SquaredIconButton } from 'components/basics/Buttons';
import { LocalizedError } from 'lib/util/LocalizedError';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { showError } from 'lib/util/ErrorHandlerUtil';

export function ManualAasInput(props: { onSubmit: (input: string) => Promise<void> }) {
    const [inputValue, setInputValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>('');
    const intl = useIntl();
    const inputRef = useRef<HTMLInputElement>(null);
    const notificationSpawner = useNotificationSpawner();

    useEffect(() => {
        inputRef?.current?.focus();
    }, []);

    const setError = (msg: string) => {
        setIsError(true);
        setErrorText(msg);
    };

    const clearError = () => {
        setIsError(false);
        setErrorText('');
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await props.onSubmit(inputValue);
        } catch (e) {
            setIsLoading(false);
            const msg = e instanceof LocalizedError ? e.descriptor : messages.mnestix.unexpectedError;
            setError(intl.formatMessage(msg));
            if (!(e instanceof LocalizedError)) showError(e, notificationSpawner);
        }
    };

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        // Allow submit via enter
        if (event.key === 'Enter' && !!inputValue) {
            await handleSubmit();
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        clearError();
    };

    return (
        <Box display="flex" justifyContent="center">
            <TextField
                id="manual-input"
                label={<FormattedMessage {...messages.mnestix.aasOrAssetId} />}
                error={isError}
                helperText={errorText}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                data-testid="aasId-input"
                autoFocus={true}
                value={inputValue}
                inputRef={inputRef}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => {
                                    setInputValue('');
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <SquaredIconButton
                sx={{ ml: 1 }}
                endIcon={<ArrowForward />}
                disabled={!inputValue}
                loading={isLoading}
                onClick={handleSubmit}
                data-testid="aasId-submit-button"
            />
        </Box>
    );
}
