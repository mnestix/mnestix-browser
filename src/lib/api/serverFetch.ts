'use server';

import { ApiResponseWrapper, ApiResponseWrapperUtil, ApiResultStatus } from 'lib/services/apiResponseWrapper';

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
        return ApiResponseWrapperUtil.fromResponse<T>(response);
    } catch (e) {
        const message = 'this could be a network error';
        console.warn(message);
        return ApiResponseWrapperUtil.fromErrorCode(ApiResultStatus.UNKNOWN_ERROR, message);
    }
}
