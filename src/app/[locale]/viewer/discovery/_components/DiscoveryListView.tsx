'use client';

import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useState } from 'react';
import DiscoveryList from 'app/[locale]/viewer/discovery/_components/DiscoveryList';
import { useSearchParams } from 'next/navigation';
import { Typography } from '@mui/material';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { IDiscoveryListEntry } from 'lib/types/DiscoveryListEntry';
import AssetNotFound from 'components/basics/AssetNotFound';
import { isAasAvailableInRepo } from 'lib/util/checkAasAvailabilityUtil';
import { useEnv } from 'app/env/provider';
import { encodeBase64 } from 'lib/util/Base64Util';
import ListHeader from 'components/basics/ListHeader';
import { performDiscoveryAasSearch, performRegistryAasSearch } from 'lib/services/search-actions/searchActions';
import { performSearchAasFromAllRepositories } from 'lib/services/repository-access/repositorySearchActions';
import { RepoSearchResult } from 'lib/services/repository-access/RepositorySearchService';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

export const DiscoveryListView = () => {
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [discoveryListEntries, setDiscoveryListEntries] = useState<IDiscoveryListEntry[]>([]);
    const [isError, setIsError] = useState<boolean>(false);
    const intl = useIntl();
    const searchParams = useSearchParams();
    const encodedAssetId = searchParams.get('assetId');
    const assetId = encodedAssetId ? decodeURI(encodedAssetId) : undefined;
    const encodedAasId = searchParams.get('aasId');
    const aasId = encodedAasId ? decodeURI(encodedAasId) : undefined;
    const env = useEnv();

    useAsyncEffect(async () => {
        setIsLoadingList(true);
        const entryList: IDiscoveryListEntry[] = [];

        if (assetId) {
            const aasIds = await performDiscoveryAasSearch(assetId);

            if (!aasIds || aasIds.length === 0) {
                setIsLoadingList(false);
                return;
            }

            await Promise.all(
                aasIds.map(async (aasId) => {
                    try {
                        const registrySearchResult = ApiResponseWrapper.fromPlainObject(await performRegistryAasSearch(aasId));
                        let aasRepositoryUrl;
                        if (!registrySearchResult.isSuccess()) {
                            if (env.AAS_REPO_API_URL) aasRepositoryUrl = (await isAasAvailableInRepo(aasId, env.AAS_REPO_API_URL)) ? env.AAS_REPO_API_URL : undefined;
                            if (!aasRepositoryUrl) throw new Error('replace throw by ApiResponseWrapper result');
                        } else {
                            aasRepositoryUrl = registrySearchResult?.result!.aasData?.aasRegistryRepositoryOrigin;
                        }

                        entryList.push({
                            aasId: aasId,
                            repositoryUrl: aasRepositoryUrl,
                        });
                    } catch (e) {
                        console.warn(e);
                        entryList.push({
                            aasId: aasId,
                            repositoryUrl: undefined,
                        });
                    }
                }),
            );
        } else if (aasId) {
            const response = ApiResponseWrapper.fromPlainObject(
                await performSearchAasFromAllRepositories(encodeBase64(aasId)),
            );
            let searchResults: RepoSearchResult[] = [];
            if (response.isSuccess()) searchResults = response.result!;
            else setIsError(true);
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
            <ListHeader namespace={'discoveryList'} keyValue={'header'} optionalID={assetId ?? aasId} />
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
