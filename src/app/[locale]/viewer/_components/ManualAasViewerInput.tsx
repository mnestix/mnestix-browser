import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { messages } from 'lib/i18n/localization';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { showError } from 'lib/util/ErrorHandlerUtil';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleSearchForAas } from 'lib/searchUtilActions/search';
import { SquaredIconButton } from 'components/basics/Buttons';

export function ManualAASViewerInput() {
    const [val, setVal] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>('');
    const navigate = useRouter();
    const intl = useIntl();
    const notificationSpawner = useNotificationSpawner();
    const inputRef = useRef<HTMLInputElement>(null);
    const [, setAas] = useAasState();
    const [, setRegistryAasData] = useRegistryAasState();

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
    
    const browseAasUrl = async (val: string) => {
        const aasSearch = await handleSearchForAas(val);

        if (aasSearch.aas){
            setAas(aasSearch.aas);
            setRegistryAasData(aasSearch.aasData);
        }
        navigate.push(aasSearch.aasUrl);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await browseAasUrl(val);
        } catch (e: unknown) {
            setIsLoading(false);
            showError(e, notificationSpawner);
            if (e instanceof Response && e.status === 404) {
                setError(intl.formatMessage(messages.mnestix.notFound));
                return;
            }
            setError(intl.formatMessage(messages.mnestix.unexpectedError));
        }
    };

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        // Allow submit via enter
        if (event.key === 'Enter' && !!val) {
            await handleSubmit();
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVal(event.target.value);
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
                value={val}
                inputRef={inputRef}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => {
                                    setVal('');
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
                disabled={!val}
                loading={isLoading}
                onClick={handleSubmit}
                data-testid="aasId-submit-button"
            />
        </Box>
    );
}
