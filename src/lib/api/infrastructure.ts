﻿import { getServerSession } from 'next-auth';
import { performServerFetch, performServerFetchLegacy } from 'lib/api/serverFetch';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { authOptions } from 'authConfig';

const initializeRequestOptions = async (bearerToken: string, init?: RequestInit) => {
    init = init || {};
    init.headers = {
        ...init.headers,
        Authorization: `Bearer ${bearerToken}`,
    };

    return init;
};

const getBearerToken = async () => {
    const session = await getServerSession(authOptions);
    if (session && session.accessToken) {
        return session.accessToken;
    } else {
        return '';
    }
};

/**
 * @deprecated use mnesticFetch() instead
 */
export const mnestixFetchLegacy = ():
    | {
          fetch(url: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response>;
      }
    | undefined => {
    return {
        fetch: async (url: RequestInfo, init?: RequestInit) => {
            const response = await performServerFetchLegacy(
                url,
                await initializeRequestOptions(await getBearerToken(), init),
            );
            return new Response(response);
        },
    };
};

export function mnestixFetch(): {
    fetch<T>(url: RequestInfo | URL, init?: RequestInit | undefined): Promise<ApiResponseWrapper<T>>;
} {
    return {
        fetch: async (url: RequestInfo, init?: RequestInit) => {
            return await performServerFetch(url, await initializeRequestOptions(await getBearerToken(), init));
        },
    };
}

export const sessionLogOut = async (keycloakEnabled: boolean) => {
    if (!keycloakEnabled) return;
    try {
        await fetch('/api/auth/logout', { method: 'GET' });
    } catch (err) {
        console.error(err);
    }
};
