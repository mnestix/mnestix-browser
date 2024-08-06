import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { JWT } from 'next-auth/jwt';

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

const keycloakEnabled = process.env.KEYCLOAK_ENABLED?.toLowerCase() === 'true'.toLowerCase();

export const authOptions: AuthOptions = {
    providers: [
        ...(keycloakEnabled ? [
            KeycloakProvider({
                clientId: process.env.KEYCLOAK_CLIENT_ID ? process.env.KEYCLOAK_CLIENT_ID : '',
                clientSecret: 'process.env.KEYCLOAK_CLIENT_SECRET',
                issuer: process.env.KEYCLOAK_ISSUER
            })
        ] : [
            AzureADProvider({
                clientId: process.env.AD_CLIENT_ID ? process.env.AD_CLIENT_ID : '',
                clientSecret: process.env.AD_SECRET_VALUE ?? '',
                tenantId: process.env.AD_TENANT_ID,
                authorization: { params: { scope: `openid ${process.env.APPLICATION_ID_URI}admin.write` } },
            })
        ])
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, account }) {
            const nowTimeStamp = Math.floor(Date.now() / 1000);

            if (account) {
                token.access_token = account.access_token;
                token.id_token = account.id_token;
                token.expires_at = account.expires_at;
                token.refresh_token = account.refresh_token;
                return token;
            } else if (nowTimeStamp < (token.expires_at as number)) {
                return token;
            } else {
                if(!keycloakEnabled) return token;
                try {
                    console.warn('Refreshing access token...');
                    const newToken = await refreshAccessToken(token);
                    console.info('Token successfully refreshed.');
                    return newToken;
                } catch (error) {
                    console.error('Error refreshing access token', error);
                    return { ...token, error: 'RefreshAccessTokenError' };
                }
            }
        },
        async session({ session, token }) {
            session.accessToken = token.access_token as string;
            session.idToken = token.id_token as string;
            return session
        },
    }
}


const refreshAccessToken = async (token: JWT) => {
    const resp = await fetch(`${process.env.KEYCLOAK_REFRESH_TOKEN_URL}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID ? process.env.KEYCLOAK_CLIENT_ID : '',
            client_secret: 'process.env.AZURE_AD_CLIENT_SECRET',
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token as string,
        }),
        method: 'POST',
    });
    const refreshToken = await resp.json();
    if (!resp.ok) throw refreshToken;

    return {
        ...token,
        access_token: refreshToken.access_token,
        id_token: refreshToken.id_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in,
        refresh_token: refreshToken.refresh_token,
    };
}