import { getSession } from 'next-auth/react';

const initializeRequestOptions = async (bearerToken: string, init?: RequestInit) => {
    init = init || {};
    init.headers = {
        ...init.headers,
        Authorization: `Bearer ${bearerToken}`,
    };

    return init;
};

const getBearerToken = async () => {
    const session = await getSession();
    if (session && session.accessToken) {
        return session.accessToken;
    } else {
        return '';
    }
};

export const mnestixFetch = (): {
    fetch(url: RequestInfo, init?: (RequestInit | undefined)): Promise<Response>
} | undefined => {
    return {
        fetch: async (url: RequestInfo, init?: RequestInit) => {
            const response = await fetch(url, await initializeRequestOptions(await getBearerToken(), init));

            if (response.status !== 401) {
                return response;
            }
            return response;
        },
    };
};

export const sessionLogOut = async (keycloakEnabled: boolean) => {
    if (!keycloakEnabled) return;
    try {
        await fetch('/api/auth/logout', { method: 'GET' });
    } catch (err) {
        console.error(err);
    }
}
