'use server';

import { mnestixFetchLegacy } from 'lib/api/infrastructure';
import { AasListClient, AasListEntry } from 'lib/api/generated-api/clients.g';

const aasListApi = AasListClient.create(process.env.MNESTIX_BACKEND_API_URL, mnestixFetchLegacy());

export async function getAasListEntries(): Promise<AasListEntry[]> {
    return aasListApi.getAasListEntries();
}
