'use client';

import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { CenteredLoadingSpinner } from "components/basics/CenteredLoadingSpinner";
import { useState } from "react";
import DiscoveryList from "app/[locale]/viewer/discovery/_components/DiscoveryList";

export const DiscoveryListView = () => {
    const [isLoadingList, setIsLoadingList] = useState(false);
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    
    const tableHeaders = [
        { label: intl.formatMessage(messages.mnestix.discoveryList.aasIdHeading) },
        { label: intl.formatMessage(messages.mnestix.discoveryList.repositoryUrl) },
    ];

    return (
        <>
            {isLoadingList && <CenteredLoadingSpinner sx={{ mt: 10 }} />}
            {!isLoadingList && (
                <>
                    <DiscoveryList tableHeaders={tableHeaders}/>
                </>
            )}
        </>
    );
};
