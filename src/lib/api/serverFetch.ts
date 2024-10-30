'use server';

import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapFileResponse,
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

        const contentType = response.headers.get('Content-Type') || '';

        if (!contentType.includes('application/json')) {
            return wrapFileResponse(response);
        }

        return wrapResponse<T>(response);
    } catch (e) {
        const message = 'this could be a network error';
        console.warn(message);
        return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, message);
    }
}
