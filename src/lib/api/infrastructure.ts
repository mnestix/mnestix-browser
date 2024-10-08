import { performServerFetch } from 'lib/api/serverFetch';
import { getServerSession } from 'next-auth';
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

export const mnestixFetch = ():
    | {
          fetch(url: RequestInfo, init?: RequestInit | undefined): Promise<Response>;
      }
    | undefined => {
    return {
        fetch: async (url: RequestInfo, init?: RequestInit) => {
            const text = await performServerFetch(url, await initializeRequestOptions(await getBearerToken(), init));
            return new Response(text);
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
};
