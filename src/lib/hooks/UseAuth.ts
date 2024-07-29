import { useAccount, useMsal } from '@azure/msal-react';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useState } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { signIn, signOut, useSession } from 'next-auth/react';

export function useAuth(): Auth {
    const [bearerToken, setBearerToken] = useState<string>('');
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const { data: session, status, update } = useSession()
    
    useAsyncEffect(async () => {
        if (session) {
            setBearerToken('Bearer ' + session.token);
        } else {
            // TODO forward to login
        }
    }, [session]);

    return {
        getBearerToken: (): string => {
            return bearerToken;
        },
        login: (): void => {
            signIn('keycloak').catch((e) => {
                console.error(e);
            });
        },
        logout: (): void => {
            signOut().catch((e) => {
                console.error(e);
            });
        },
        getAccount: (): AccountInfo | null => {
            return account;
        },
        isLoggedIn: status === 'authenticated',
    };
}

export interface Auth {
    getBearerToken: () => string;
    login: () => void;
    logout: () => void;
    getAccount: () => AccountInfo | null;
    isLoggedIn: boolean;
}
