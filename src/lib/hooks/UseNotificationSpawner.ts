import { Notification, useNotificationContext } from 'components/contexts/NotificationContext';

export function useNotificationSpawner(): NotificationSpawner {
    const [, setGlobalNotification] = useNotificationContext();
    return {
        spawn: (notification: Notification): void => {
            setGlobalNotification(notification);
        },
    };
}

export interface NotificationSpawner {
    spawn: (notification: Notification) => void;
}
