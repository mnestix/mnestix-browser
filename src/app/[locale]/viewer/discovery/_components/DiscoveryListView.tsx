'use client';

import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useState } from 'react';
import DiscoveryList from 'app/[locale]/viewer/discovery/_components/DiscoveryList';
import { useSearchParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { handleAasDiscoverySearch, handleAasRegistrySearch } from 'lib/searchUtilActions/searchServer';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { IDiscoveryListEntry } from 'lib/types/DiscoveryListEntry';
import AssetNotFound from 'components/basics/AssetNotFound';
import { isAasAvailableInRepo } from 'lib/util/checkAasAvailabilityUtil';
import { useEnv } from 'app/env/provider';
import { getAasFromAllRepos, RepoSearchResult } from 'lib/searchUtilActions/SearchRepositoryHelper';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import ListHeader from 'components/basics/ListHeader';

export const DiscoveryListView = () => {
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [discoveryListEntries, setDiscoveryListEntries] = useState<IDiscoveryListEntry[]>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const intl = useIntl();
    const searchParams = useSearchParams();
    const assetId = searchParams.get('assetId');
    const base64AasId = searchParams.get('aasId')
    const aasId = base64AasId? decodeURIComponent(base64AasId) : undefined;
    const { repositoryClient } = useApis();
    const env = useEnv();

    useAsyncEffect(async () => {
        setIsLoadingList(true);
        const entryList: IDiscoveryListEntry[] = [];

        if (assetId) {
            const aasIds = await handleAasDiscoverySearch(assetId);

            // TODO do it asynchronous
            for (const aasId of aasIds) {
                const registrySearchResult = await handleAasRegistrySearch(aasId);

                let aasRepositoryUrl;
                if (registrySearchResult) {
                    aasRepositoryUrl = (await isAasAvailableInRepo(aasId, env.AAS_REPO_API_URL))
                        ? env.AAS_REPO_API_URL
                        : undefined;
                }

                entryList.push({
                    aasId: aasId,
                    repositoryUrl: aasRepositoryUrl,
                });
            }
        } else if (aasId) {
            let searchResults: RepoSearchResult[] = [];
            try {
                searchResults = await getAasFromAllRepos(encodeBase64(aasId), repositoryClient);
            } catch (e) {
                setIsError(true);
            }

            for (const searchResult of searchResults) {
                entryList.push({
                    aasId: searchResult.aas.id,
                    repositoryUrl: searchResult.location,
                });
            }
        }

        if (entryList.length < 1) {
            setIsError(true);
        } else {
            setDiscoveryListEntries(entryList);
        }

        setIsLoadingList(false);
    }, []);

    const tableHeaders = [
        { label: intl.formatMessage(messages.mnestix.aasList.picture) },
        { label: intl.formatMessage(messages.mnestix.discoveryList.aasIdHeading) },
        { label: intl.formatMessage(messages.mnestix.discoveryList.repositoryUrl) },
    ];

    return (
        <>
            <ListHeader namespace={'discoveryList'} keyValue={'header'} optionalID={assetId ?? aasId } />
            {isLoadingList && <CenteredLoadingSpinner sx={{ mt: 10 }} />}
            {!isLoadingList && !isError && (
                <>
                    <Typography marginBottom={3}>
                        <FormattedMessage {...messages.mnestix.discoveryList.subtitle} />
                    </Typography>
                    <DiscoveryList tableHeaders={tableHeaders} data={discoveryListEntries} />
                </>
            )}
            {isError && <AssetNotFound id={assetId ?? aasId} />}
        </>
    );
};
