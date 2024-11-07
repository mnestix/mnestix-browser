import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { JWT } from 'next-auth/jwt';

const isEmptyOrWhiteSpace = (input: string | undefined) => {
    return !input || input.trim() === '';
};

const keycloakEnabled = (process.env.KEYCLOAK_ENABLED || 'false').toLowerCase() === 'true'.toLowerCase();
const keycloakLocalUrl = process.env.KEYCLOAK_LOCAL_URL;
const keycloakIssuer = process.env.KEYCLOAK_ISSUER;
const serverUrlFromConfig = isEmptyOrWhiteSpace(keycloakLocalUrl) ? keycloakIssuer : keycloakLocalUrl;
const realm = process.env.KEYCLOAK_REALM;
const requestedResource = process.env.APPLICATION_ID_URI?.endsWith('/')
    ? process.env.APPLICATION_ID_URI
    : `${process.env.APPLICATION_ID_URI}/`;

export const authOptions: AuthOptions = {
    providers: [
        ...(keycloakEnabled
            ? [
                  KeycloakProvider({
                      clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
                      clientSecret: '-', // not required by the AuthFlow but required by NextAuth Provider, here placeholder only
                      issuer: `${keycloakIssuer}/realms/${realm}`,
                      authorization: {
                          params: {
                              scope: 'openid email profile',
                          },
                          url: `${serverUrlFromConfig}/realms/${realm}/protocol/openid-connect/auth`,
                      },
                      token: `${keycloakIssuer}/realms/${realm}/protocol/openid-connect/token`,
                      userinfo: `${keycloakIssuer}/realms/${realm}/protocol/openid-connect/userinfo`,
                  }),
              ]
            : [
                  AzureADProvider({
                      clientId: process.env.AD_CLIENT_ID ? process.env.AD_CLIENT_ID : '',
                      clientSecret: process.env.AD_SECRET_VALUE ?? '',
                      tenantId: process.env.AD_TENANT_ID,
                      authorization: { params: { scope: `openid ${requestedResource}admin.write` } },
                  }),
              ]),
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
            }

            if (!keycloakEnabled) return token;

            try {
                console.warn('Refreshing access token...');
                return await refreshAccessToken(token);
            } catch (error) {
                console.error('Error refreshing access token', error);
                return { ...token, error: 'RefreshAccessTokenError' };
            }
        },
        async session({ session, token }) {
            session.accessToken = token.access_token as string;
            session.idToken = token.id_token as string;
            return session;
        },
    },
};

const refreshAccessToken = async (token: JWT) => {
    const resp = await fetch(`${keycloakIssuer}/realms/${realm}/protocol/openid-connect/token`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID ? process.env.KEYCLOAK_CLIENT_ID : '',
            client_secret: '-', // not required by the AuthFlow but required by NextAuth Provider, here placeholder only
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
};
