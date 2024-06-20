import { Typography } from '@mui/material';
import { NotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { NotFoundError } from 'lib/errors/NotFoundError';

export function showError(e: unknown, notificationSpawner: NotificationSpawner) {
    console.error('Error:', e);
    if (e instanceof Response) {
        switch (e.status) {
            case 404:
                showNotFoundError(notificationSpawner);
                return;
            default:
                notificationSpawner.spawn({
                    message: (
                        <>
                            <FormattedMessage {...messages.mnestix.unexpectedError} />
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                                {e.status}: &quot;{e.statusText}&quot;
                            </Typography>
                        </>
                    ),
                    severity: 'error',
                });
                return;
        }
    }

    if (e instanceof NotFoundError) {
        showNotFoundError(notificationSpawner);
        return;
    }

    notificationSpawner.spawn({
        message: <FormattedMessage {...messages.mnestix.unexpectedError} />,
        severity: 'error',
    });

    function showNotFoundError(notificationSpawner: NotificationSpawner) {
        notificationSpawner.spawn({
            message: <FormattedMessage {...messages.mnestix.notFound} />,
            severity: 'error',
        });
    }
}
