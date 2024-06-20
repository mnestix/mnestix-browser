import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';

const initializeRequestOptions = async (bearerToken: string, init?: RequestInit) => {
    init = init || {};
    init.headers = {
        ...init.headers,
        Authorization: `Bearer ${bearerToken}`,
    };

    return init;
};

const getBearerToken = async (instance: IPublicClientApplication, account: AccountInfo | null, applicationIdUri: string) => {
    if (account) {
        const authenticationResult = await instance.acquireTokenSilent({
            scopes: [`${applicationIdUri}admin.write`],
            account: account,
        });
        return authenticationResult.accessToken;
    }

    // TODO: handle if not logged in
    return '';
};

export const mnestixFetch = (instance: IPublicClientApplication, account: AccountInfo | null, applicationIdUri: string): {
    fetch(url: RequestInfo, init?: (RequestInit | undefined)): Promise<Response>
} | undefined => {
    return {
        fetch: async (url: RequestInfo, init?: RequestInit) => {
            const response = await fetch(
                url,
                await initializeRequestOptions(await getBearerToken(instance, account, applicationIdUri), init),
            );

            if (response.status !== 401) {
                return response;
            }
            // Todo route to login page
            // await redirectToLoginPage();

            return response;
        },
    };
};
