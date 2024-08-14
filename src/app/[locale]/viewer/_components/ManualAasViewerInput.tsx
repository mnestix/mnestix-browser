import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useEffect, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { messages } from 'lib/i18n/localization';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { encodeBase64 } from 'lib/util/Base64Util';
import { showError } from 'lib/util/ErrorHandlerUtil';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleAasDiscoverySearch, handleAasRegistrySearch } from 'lib/searchUtilActions/search';
import { useApis } from 'components/azureAuthentication/ApiProvider';
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
    const { repositoryClient } = useApis();

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
    
    const handleSearchForAas = async (val: string) => {
        const aasIds = await handleAasDiscoverySearch(val);
        if (aasIds && aasIds.length > 1) {
            return `/viewer/discovery?assetId=${val}`;
        } else {
            // Check if an AAS ID is found in the Discovery service, or assign the input parameter for further search.
            // If there is exactly one AAS ID in the aasIds array, use it; otherwise, use the input parameter 'val'.
            const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : val;
            const registrySearchResult = await handleAasRegistrySearch(aasId);
            const aas =
                registrySearchResult != null
                    ? registrySearchResult.registryAas
                    : await repositoryClient.getAssetAdministrationShellById(encodeBase64(aasId));

            setAas(aas);
            registrySearchResult?.registryAasData != null
                ? setRegistryAasData({
                    submodelDescriptors: registrySearchResult?.registryAasData?.submodelDescriptors,
                    aasRegistryRepositoryOrigin:
                    registrySearchResult?.registryAasData?.aasRegistryRepositoryOrigin,
                })
                : setRegistryAasData(null);

            return `/viewer/${encodeBase64(aas.id)}`;
        }
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const url = await handleSearchForAas(val);
            navigate.push(url);
            
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
