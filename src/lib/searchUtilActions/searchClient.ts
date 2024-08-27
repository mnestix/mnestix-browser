'use client';

import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import { AssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/api';
import { handleAasDiscoverySearch, handleAasRegistrySearch } from 'lib/searchUtilActions/searchServer';
import { getAasFromAllRepos } from 'lib/searchUtilActions/SearchRepositoryHelper';

export type AasData = {
    submodelDescriptors: SubmodelDescriptor[] | undefined;
    aasRegistryRepositoryOrigin: string | undefined;
};

export type AasSearchResult = {
    redirectUrl: string;
    aas: AssetAdministrationShell | null;
    aasData: AasData | null;
};

export async function handleSearchForAas(
    val: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
): Promise<AasSearchResult> {
    const aasIds = await handleAasDiscoverySearch(val);
    if (aasIds && aasIds.length > 1) {
        return {
            redirectUrl: `/viewer/discovery?assetId=${val}`,
            aas: null,
            aasData: null,
        };
    } else {
        // Check if an AAS ID is found in the Discovery service, or assign the input parameter for further search.
        // If there is exactly one AAS ID in the aasIds array, use it; otherwise, use the input parameter 'val'.
        const aasId = aasIds && aasIds.length === 1 ? aasIds[0] : val;
        const registrySearchResult = await handleAasRegistrySearch(aasId);
        let aas;

        if (registrySearchResult) {
            aas = registrySearchResult.registryAas;
        } else {
            //Try to get the AAS from the standard AAS repository
            aas = await repositoryClient.getAssetAdministrationShellById(encodeBase64(aasId));
            //If not found, try to get the AAS from the AAS repository list
            if (!aas) {
                aas = await getAasFromAllRepos(encodeBase64(aasId), repositoryClient);
            }
        }

        const aasData =
            registrySearchResult?.registryAasData != null
                ? {
                      submodelDescriptors: registrySearchResult.registryAasData.submodelDescriptors,
                      aasRegistryRepositoryOrigin: registrySearchResult.registryAasData.aasRegistryRepositoryOrigin,
                  }
                : null;

        return {
            redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
            aas: aas,
            aasData: aasData,
        };
    }
}
