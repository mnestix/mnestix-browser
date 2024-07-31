import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { sessionLogOut } from 'lib/api/infrastructure';

export function useAuth(): Auth {
    const [bearerToken, setBearerToken] = useState<string>('');
    const { data: session, status } = useSession()
    
    useAsyncEffect(async () => {
        if (session) {
            setBearerToken('Bearer ' + session.accessToken);
        } else {
            // TODO forward to login
        }
    }, [session]);

    return {
        getBearerToken: (): string => {
            return bearerToken;
        },
        login: (): void => {
            signIn().catch((e) => {
                console.error(e);
            });
        },
        logout: async (): Promise<void> => {
            await sessionLogOut().then(() => signOut({ callbackUrl: '/' }).catch((e) => {
                console.error(e);
            }));
        },
        getAccount: (): Session | null => {
            return session;
        },
        isLoggedIn: status === 'authenticated',
    };
}

export interface Auth {
    getBearerToken: () => string;
    login: () => void;
    logout: () => void;
    getAccount: () => Session | null;
    isLoggedIn: boolean;
}
