'use server';

import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

export async function performServerFetch(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<string> {
    const result = await fetch(input, init);
    if (result.status >= 200 && result.status < 300) {
        return Promise.resolve(await result.text());
    } else throw result;
}

// TODO move this methods into a separate class like serverFetcher and maybe rename this into serverFetchActions
export async function getSubmodelFromEndpoint(url: string): Promise<Submodel> {
    const response = await fetch(url, {
        method: 'GET',
    });
    return response.json();
}
