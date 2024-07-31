'use client';

import { ReactNode } from 'react';
import { ClientLayout } from './clientLayout';
import { SessionProvider } from 'next-auth/react';

export type msalWrapperProps = {
    children: ReactNode;
};

export const SessionWrapper = ({ children }: Readonly<msalWrapperProps>) => {

    return (
        <SessionProvider>
            <ClientLayout> {children} </ClientLayout>
        </SessionProvider>
    );
};