import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak"
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: AuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID ? process.env.KEYCLOAK_CLIENT_ID : '',
            clientSecret: "process.env.KEYCLOAK_CLIENT_SECRET",
            issuer: process.env.KEYCLOAK_ISSUER
        }),
        AzureADProvider({
            clientId: process.env.AD_CLIENT_ID ? process.env.AD_CLIENT_ID : '',
            clientSecret: "process.env.AZURE_AD_CLIENT_SECRET",
            tenantId: process.env.AD_TENANT_ID,
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, account}) {
            if(account) {
                token.accessToken = account.access_token
                token.id_token = account.id_token
                token.expires_at = account.expires_at
                token.refresh_token = account.refresh_token
                return token
            }
            return token
        },
        async session({ session, token}) {
            session.token = token.accessToken as string;
            return session
        }
    }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }

declare module "next-auth" {
    interface Session extends DefaultSession {
        token: string;
    }
}