'use client';

import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

export type Notification = {
    title?: React.ReactNode;
    message?: React.ReactNode;
    severity?: 'error' | 'info' | 'success' | 'warning';
};

type NotificationContextType = [Notification | null, React.Dispatch<React.SetStateAction<Notification | null>>];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => useContext(NotificationContext) as NotificationContextType;

export const NotificationContextProvider = (props: PropsWithChildren) => (
    <NotificationContext.Provider value={useState<Notification | null>(null)}>
        {props.children}
    </NotificationContext.Provider>
);
