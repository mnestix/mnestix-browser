'use client';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { encodeBase64 } from 'lib/util/Base64Util';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { Box, Button, Typography } from '@mui/material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { NotFoundError } from 'lib/errors/NotFoundError';
import { useState } from 'react';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEnv } from 'app/env/provider';

export const RedirectToViewer = () => {
    const { discoveryServiceClient } = useApis();
    const navigate = useRouter();
    const searchParams = useSearchParams();
    const assetIdParam = searchParams.get('assetId')?.toString();
    const notificationSpawner = useNotificationSpawner();
    const env = useEnv();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useAsyncEffect(async () => {
        try {
            setIsLoading(true);
            if (env.DISCOVERY_API_URL != '') {
                await navigateToViewerOfAsset(decodeURIComponent(assetIdParam ?? ''));
            }
        } catch (e) {
            setIsLoading(false);
            setIsError(true);
            showError(e, notificationSpawner);
        }
    }, [env]);

    async function navigateToViewerOfAsset(assetId: string | undefined): Promise<void> {
        const aasIds = await getAasIdsOfAsset(assetId);
        assertAnAasIdExists(aasIds);
        const targetUrl = determineViewerTargetUrl(aasIds);
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
            {isError && (
                <>
                    <Typography variant="h1" color="primary" align="center" sx={{ mt: 2 }}>
                        <FormattedMessage {...messages.mnestix.cannotLoadAasId.header} />
                    </Typography>
                    <Typography align="center" sx={{ mt: 2 }}>
                        <FormattedMessage
                            {...messages.mnestix.cannotLoadAasId.text}
                            values={{ assetId: assetIdParam }}
                        />
                        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={() => navigate.push('/')}>
                                <FormattedMessage {...messages.mnestix.toHome} />
                            </Button>
                        </Box>
                    </Typography>
                </>
            )}
        </Box>
    );
};
