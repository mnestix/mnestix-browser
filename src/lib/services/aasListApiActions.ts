'use server';

import { mnestixFetch } from 'lib/api/infrastructure';
import { AasListClient, AasListEntry } from 'lib/api/generated-api/clients.g';

export async function getAasListEntries(): Promise<AasListEntry[]> {
    const aasListApi = AasListClient.create(process.env.MNESTIX_BACKEND_API_URL, mnestixFetch());
    return aasListApi.getAasListEntries();
}
