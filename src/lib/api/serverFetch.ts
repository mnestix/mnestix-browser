'use server';

import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

/**
 * @deprecated use performServerFetch() instead
 */
export async function performServerFetchLegacy(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<string> {
    const result = await fetch(input, init);
    if (result.status >= 200 && result.status < 300) {
        return Promise.resolve(await result.text());
    } else throw result;
}

export async function performServerFetch(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<ApiResponseWrapper<string>> {
    const result = await fetch(input, init);
    return new ApiResponseWrapper<string>(await result.text(), result.status, result.statusText);
}
