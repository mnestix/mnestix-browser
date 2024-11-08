'use client';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Box } from '@mui/material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { NotFoundError } from 'lib/errors/NotFoundError';
import { useState } from 'react';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useRouter, useSearchParams } from 'next/navigation';
import AssetNotFound from 'components/basics/AssetNotFound';
import { useAasOriginSourceState, useAasState } from 'components/contexts/CurrentAasContext';
import { performDiscoveryAasSearch } from 'lib/services/search-actions/searchActions';
import { wrapSuccess } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { LocalizedError } from 'lib/util/LocalizedError';
import { messages } from 'lib/i18n/localization';

export const RedirectToViewer = () => {
    const navigate = useRouter();
    const searchParams = useSearchParams();
    const assetIdParam = searchParams.get('assetId')?.toString();
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [, setAas] = useAasState();
    const [, setAasOriginUrl] = useAasOriginSourceState();

    useAsyncEffect(async () => {
        try {
            setIsLoading(true);
            await navigateToViewerOfAsset(decodeURIComponent(assetIdParam ?? ''));
        } catch (e) {
            setIsLoading(false);
            setIsError(true);
            showError(e, notificationSpawner);
        }
    }, []);

    async function navigateToViewerOfAsset(assetId: string | undefined): Promise<void> {
        const { isSuccess, result: aasIds } = await getAasIdsOfAsset(assetId);

        if (!isSuccess) throw new LocalizedError(messages.mnestix.aasUrlNotFound);

        assertAtLeastOneAasIdExists(aasIds);
        const targetUrl = determineViewerTargetUrl(aasIds);
        setAas(null);
        setAasOriginUrl(null)
        navigate.replace(targetUrl);
    }

    async function getAasIdsOfAsset(assetId: string | undefined) {
        if (!assetId) {
            throw new NotFoundError();
        }
        const response = await performDiscoveryAasSearch(assetId);
        if (response.isSuccess) return response;
        return wrapSuccess([]);
    }

    function assertAtLeastOneAasIdExists(aasIds: string[]) {
        if (aasIds.length === 0) {
            throw new NotFoundError();
        }
    }

    function determineViewerTargetUrl(aasIds: string[]) {
        const encodedAasId = encodeBase64(aasIds[0]);
        return '/viewer/' + encodedAasId;
    }

    return (
        <Box sx={{ p: 2, m: 'auto' }}>
            {isLoading && <CenteredLoadingSpinner />}
            {isError && <AssetNotFound id={assetIdParam} />}
        </Box>
    );
};
