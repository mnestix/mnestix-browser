'use client';
import { Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { ManualAASViewerInput } from '../viewer/_components/ManualAasViewerInput';
import { QrScanner } from 'app/[locale]/_components/QrScanner';
import { handleAasDiscoverySearch, handleAasRegistrySearch } from 'lib/searchUtilActions/search';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useRouter } from 'next/navigation';

export const DashboardInput = () => {
    const [, setAas] = useAasState();
    const [, setRegistryAasData] = useRegistryAasState();
    const { repositoryClient } = useApis();
    const navigate = useRouter();

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
                      aasRegistryRepositoryOrigin: registrySearchResult?.registryAasData?.aasRegistryRepositoryOrigin,
                  })
                : setRegistryAasData(null);

            // If not found: Error: AAS could not be found

            return `/viewer/${encodeBase64(aas.id)}`;
        }
    };

    const browseAasUrl = async (val: string) => {
        const url = await handleSearchForAas(val);
        navigate.push(url);
    };

    return (
        <>
            <Typography color="text.secondary" textAlign="center">
                <FormattedMessage {...messages.mnestix.scanAasId} />
            </Typography>
            <QrScanner onScan={browseAasUrl} />
            <Typography color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                <FormattedMessage {...messages.mnestix.orEnterManual} />:
            </Typography>
            <ManualAASViewerInput />
        </>
    );
};
