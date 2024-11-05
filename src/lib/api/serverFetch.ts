'use server';

import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';

/**
 * @deprecated use performServerFetch() instead
 */
export async function performServerFetchLegacy(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<string> {
    const response = await fetch(input, init);
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(await response.text());
    } else throw response;
}

export async function performServerFetch<T>(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<ApiResponseWrapper<T>> {
    try {
        const response = await fetch(input, init);
        console.log('fetching ' + input.toString());
        return wrapResponse<T>(response);
    } catch (e) {
        const message = 'this could be a network error';
        console.warn(message, '\nException message:', e.message);
        return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, message);
    }
}
