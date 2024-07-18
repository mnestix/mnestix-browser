import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { SquaredIconButton } from 'components/basics/SquaredIconButton';
import { ArrowForward } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useCompareAasContext } from 'components/contexts/CompareAasContext';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import CloseIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import { handleAasDiscoverySearch, handleAasRegistrySearch } from 'lib/searchUtilActions/search';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { encodeBase64 } from 'lib/util/Base64Util';

type ManualAasAddInputProps = {
    onSubmit: () => void;
    focus: boolean;
};

export function ManualAasAddInput(props: ManualAasAddInputProps) {
    const { compareAas, addAas } = useCompareAasContext();
    const [inputValue, setInputValue] = useState<string>('');
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { repositoryClient } = useApis();

    useEffect(() => {
        inputRef?.current?.focus();
    }, [props.focus]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setInputValue(event.target.value);
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            let submodelDescriptorsFromRegistry: SubmodelDescriptor[] = [];

            const aasIds = await handleAasDiscoverySearch(inputValue);
            if (aasIds && aasIds.length > 1) {
                setIsLoading(false);
                notificationSpawner.spawn({
                    message: intl.formatMessage(messages.mnestix.compare.moreAasFound),
                    severity: 'warning',
                });
            } else {
                const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : inputValue;
                const registrySearchResult = await handleAasRegistrySearch(aasId);
                const aasToAdd =
                    registrySearchResult != null
                        ? registrySearchResult.registryAas
                        : await repositoryClient.getAssetAdministrationShellById(encodeBase64(aasId));

                const aasExists = compareAas.find((aas) => aas.id === aasToAdd.id);
                if (aasExists) {
                    setIsLoading(false);
                    notificationSpawner.spawn({
                        message: intl.formatMessage(messages.mnestix.compare.aasAlreadyAdded),
                        severity: 'error',
                    });
                } else {
                    submodelDescriptorsFromRegistry = registrySearchResult?.registryAasData
                        ?.submodelDescriptors as SubmodelDescriptor[];
                    await addAas(aasToAdd as AssetAdministrationShell, submodelDescriptorsFromRegistry);
                    props.onSubmit();
                }
            }
        } catch (e: unknown) {
            setIsLoading(false);
            showError(e, notificationSpawner);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        // Allow submit via enter
        if (event.key === 'Enter' && !!inputValue) {
            handleSubmit();
        }
    };

    return (
        <Box display="flex" justifyContent="center" paddingY="20px" data-testid="manual-aas-add-input">
            <TextField
                id="manual-input"
                label={<FormattedMessage {...messages.mnestix.aasOrAssetId} />}
                data-testid="aasId-input"
                autoFocus={true}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
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
                data-testid="aasId-submit-button"
                disabled={!inputValue}
                onClick={handleSubmit}
                loading={isLoading}
            />
        </Box>
    );
}
