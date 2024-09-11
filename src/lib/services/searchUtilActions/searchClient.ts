'use client';

import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { performFullAasSearch } from 'lib/services/searchUtilActions/searchServer';

export type AasData = {
    submodelDescriptors: SubmodelDescriptor[] | undefined;
    aasRegistryRepositoryOrigin: string | undefined;
};

export type AasSearchResult = {
    redirectUrl: string;
    aas: AssetAdministrationShell | null;
    aasData: AasData | null;
};

export async function handleSearchForAas(val: string): Promise<AasSearchResult> {
    return await performFullAasSearch(val);
}
