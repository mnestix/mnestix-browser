import { useAccount, useMsal } from '@azure/msal-react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { loginRequest } from 'authConfig';
import { useState } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { useEnv } from 'app/env/provider';

export function useAuth(): Auth {
    const [bearerToken, setBearerToken] = useState<string>('');
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const env = useEnv();

    useAsyncEffect(async () => {
        if (account && env.APPLICATION_ID_URI) {
            await instance.initialize();
            const token = await instance.acquireTokenSilent({
                scopes: [`${env.APPLICATION_ID_URI}admin.write`],
                account: account,
            });
            setBearerToken('Bearer ' + token.accessToken);
        } else {
            // TODO forward to login
        }
    }, []);

    return {
        getBearerToken: (): string => {
            return bearerToken;
        },
        login: (): void => {
            instance.loginRedirect(loginRequest).catch((e) => {
                console.error(e);
            });
        },
        logout: (): void => {
            instance.logoutRedirect().catch((e) => {
                console.error(e);
            });
        },
        getAccount: (): AccountInfo | null => {
            return account;
        },
        isLoggedIn: !!account,
    };
}

export interface Auth {
    getBearerToken: () => string;
    login: () => void;
    logout: () => void;
    getAccount: () => AccountInfo | null;
    isLoggedIn: boolean;
}
