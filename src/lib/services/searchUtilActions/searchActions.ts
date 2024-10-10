'use server';

import { AasSearcher, AasSearchResult, RegistrySearchResult } from 'lib/services/searchUtilActions/AasSearcher';
import { SubmodelSearcher } from 'lib/services/searchUtilActions/SubmodelSearcher';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { Reference } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';

export async function performFullAasSearch(searchInput: string): Promise<AasSearchResult> {
    const searcher = AasSearcher.create();
    return searcher.fullSearch(searchInput);
}

export async function performRegistryAasSearch(searchInput: string): Promise<RegistrySearchResult | null> {
    const searcher = AasSearcher.create();
    return searcher.performAasRegistrySearch(searchInput);
}

export async function performDiscoveryAasSearch(searchInput: string): Promise<string[] | null> {
    const searcher = AasSearcher.create();
    return searcher.performAasDiscoverySearch(searchInput);
}

export async function performSubmodelFullSearch(
    submodelReference: Reference,
    submodelDescriptor?: SubmodelDescriptor,
): Promise<Submodel | null> {
    const searcher = SubmodelSearcher.create();
    return searcher.performSubmodelFullSearch(submodelReference, submodelDescriptor);
}
