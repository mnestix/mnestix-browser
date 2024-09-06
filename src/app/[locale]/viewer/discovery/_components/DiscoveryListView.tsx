'use client';

import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useState } from 'react';
import DiscoveryList from 'app/[locale]/viewer/discovery/_components/DiscoveryList';
import { useSearchParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { IDiscoveryListEntry } from 'lib/types/DiscoveryListEntry';
import AssetNotFound from 'components/basics/AssetNotFound';
import { isAasAvailableInRepo } from 'lib/util/checkAasAvailabilityUtil';
import { useEnv } from 'app/env/provider';
import { performDiscoveryAasSearch, performRegistryAasSearch } from 'lib/searchUtilActions/searchServer';

export const DiscoveryListView = () => {
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [discoveryListEntries, setDiscoveryListEntries] = useState<IDiscoveryListEntry[]>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const intl = useIntl();
    const searchParams = useSearchParams();
    const assetId = searchParams.get('assetId');
    const env = useEnv();

    useAsyncEffect(async () => {
        setIsLoadingList(true);
        const entryList: IDiscoveryListEntry[] = [];
        if (assetId == null) {
            setIsError(true);
            setIsLoadingList(false);
        } else {
            const aasIds = await performDiscoveryAasSearch(assetId);
            if (aasIds === null) {
                setIsError(true);
                setIsLoadingList(false);
            } else {
                for (const aasId of aasIds) {
                    const registrySearchResult = await performRegistryAasSearch(aasId);

                    const aasRepositoryUrl = registrySearchResult
                        ? registrySearchResult.registryAasData?.aasRegistryRepositoryOrigin
                        : (await isAasAvailableInRepo(aasId, env.AAS_REPO_API_URL))
                          ? env.AAS_REPO_API_URL
                          : '-';
                    entryList.push({
                        aasId: aasId,
                        repositoryUrl: aasRepositoryUrl,
                    });
                }
                setIsLoadingList(false);
            }
        }

        setDiscoveryListEntries(entryList);
    }, []);

    const tableHeaders = [
        { label: intl.formatMessage(messages.mnestix.aasList.picture) },
        { label: intl.formatMessage(messages.mnestix.discoveryList.aasIdHeading) },
        { label: intl.formatMessage(messages.mnestix.discoveryList.repositoryUrl) },
    ];

    return (
        <>
            {isLoadingList && <CenteredLoadingSpinner sx={{ mt: 10 }} />}
            {!isLoadingList && !isError && (
                <>
                    <Typography marginBottom={3}>
                        <FormattedMessage {...messages.mnestix.discoveryList.subtitle} />:{' '}
                        <Box component="span" display="inline" fontWeight={600}>
                            {assetId}
                        </Box>
                    </Typography>
                    <DiscoveryList tableHeaders={tableHeaders} data={discoveryListEntries} />
                </>
            )}
            {isError && <AssetNotFound assetId={assetId ? assetId : ''} />}
        </>
    );
};
