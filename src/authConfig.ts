import { Configuration } from '@azure/msal-browser';

declare global {
    interface Window {
        _env_: {
            NEXT_PUBLIC_AD_CLIENT_ID: string;
            NEXT_PUBLIC_AD_TENANT_ID: string;
            NEXT_PUBLIC_APPLICATION_ID_URI: string;
            NEXT_PUBLIC_LOCK_TIMESERIES_PERIOD_FEATURE_FLAG: boolean;
            NEXT_PUBLIC_USE_AUTHENTICATION_FEATURE_FLAG: boolean;
            NEXT_PUBLIC_USE_COMPARISON_FEATURE_FLAG: boolean;
            NEXT_PUBLIC_USE_AAS_LIST_FEATURE_FLAG: boolean;
            NEXT_PUBLIC_BASYX_API_URL: string;
            NEXT_PUBLIC_BACKEND_API_URL: string;
        };
    }
}

export const createMsalConfig = (clientId: string, authority: string, redirectUri: string): Configuration => {
    return {
        auth: {
            // the following two values are changed using the Environment Provider in the layout.tsx
            clientId,
            authority, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
            redirectUri,
        },
        cache: {
            cacheLocation: 'sessionStorage', // This configures where your cache will be stored
            storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        },
    };
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: [],
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
    apiTemplates: {
        scopes: [`${process.env.NEXT_PUBLIC_APPLICATION_ID_URI}admin.write`], // e.g. api://xxxxxx/access_as_user
    },
};
