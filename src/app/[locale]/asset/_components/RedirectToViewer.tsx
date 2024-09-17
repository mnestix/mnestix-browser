'use client';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Box } from '@mui/material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { NotFoundError } from 'lib/errors/NotFoundError';
import { useState } from 'react';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useSearchParams, useRouter } from 'next/navigation';
import AssetNotFound from 'components/basics/AssetNotFound';
import { useAasState } from 'components/contexts/CurrentAasContext';

export const RedirectToViewer = () => {
    const { discoveryServiceClient } = useApis();
    const navigate = useRouter();
    const searchParams = useSearchParams();
    const assetIdParam = searchParams.get('assetId')?.toString();
    const notificationSpawner = useNotificationSpawner();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [ ,setAas] = useAasState();

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
        const aasIds = await getAasIdsOfAsset(assetId);
        assertAnAasIdExists(aasIds);
        const targetUrl = determineViewerTargetUrl(aasIds);
        setAas(null);
        navigate.replace(targetUrl);
    }

    async function getAasIdsOfAsset(assetId: string | undefined) {
        if (!assetId) {
            throw new NotFoundError();
        }
        return (await discoveryServiceClient.getAasIdsByAssetId(assetId)).result;
    }

    function assertAnAasIdExists(aasIds: string[]) {
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
