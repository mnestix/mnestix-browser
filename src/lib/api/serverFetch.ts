'use server';

import { ApiResponseWrapper, ApiResultStatus } from 'lib/services/apiResponseWrapper';

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
    try {
        const result = await fetch(input, init);
        return ApiResponseWrapper.fromResponse(result);
    } catch (e) {
        const message = 'this could be a network error';
        console.warn(message);
        return ApiResponseWrapper.fromErrorCode(ApiResultStatus.UNKNOWN_ERROR, message);
    }
}
