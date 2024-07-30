import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { JWT } from 'next-auth/jwt';


export const authOptions: AuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID ? process.env.KEYCLOAK_CLIENT_ID : '',
            clientSecret: 'process.env.KEYCLOAK_CLIENT_SECRET',
            issuer: process.env.KEYCLOAK_ISSUER
        }),
        AzureADProvider({
            clientId: process.env.AD_CLIENT_ID ? process.env.AD_CLIENT_ID : '',
            clientSecret: 'process.env.AZURE_AD_CLIENT_SECRET',
            tenantId: process.env.AD_TENANT_ID,
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, account }) {
            const nowTimeStamp = Math.floor(Date.now() / 1000);

            if (account) {
                token.accessToken = account.access_token;
                token.id_token = account.id_token;
                token.expires_at = account.expires_at;
                token.refresh_token = account.refresh_token;
                return token;
            } else if (nowTimeStamp < (token.expires_at as number)) {
                return token;
            } else {
                try {
                    console.warn('Refreshing access token...');
                    return await refreshAccessToken(token);
                } catch (error) {
                    console.error('Error refreshing access token', error);
                    return { ...token, error: 'RefreshAccessTokenError' };
                }
            }
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
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