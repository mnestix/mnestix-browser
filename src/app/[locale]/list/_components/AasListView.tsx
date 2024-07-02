'use client';

import { useApis } from 'components/azureAuthentication/ApiProvider';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useEnv } from 'app/env/provider';
import { useState } from 'react';
import { AasListEntry } from 'lib/api/generated-api/clients.g';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import {
    Box,
} from '@mui/material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { SelectProductType } from "app/[locale]/list/_components/SelectProductType";
import { CompareAasListHeader } from "app/[locale]/list/_components/CompareAasListHeader";
import { AasList } from "app/[locale]/list/_components/AasList";

export const AasListView = () => {
    const { aasListClient } = useApis();
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [aasList, setAasList] = useState<AasListEntry[]>();
    const [aasListFiltered, setAasListFiltered] = useState<AasListEntry[]>();
    const [selectedAasList, setSelectedAasList] = useState<string[]>();
    const notificationSpawner = useNotificationSpawner();
    const env = useEnv();

    useAsyncEffect(async () => {
        try {
            setIsLoadingList(true);
            const list = await aasListClient.getAasListEntries();
            setAasList(list);
            setAasListFiltered(list);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    /**
     * Update the list of currently selected aas
     */
    const updateSelectedAasList = (isChecked: boolean, aasId: string | undefined) => {
        if (!aasId) return;
        let selected: string[] = [];

        if (isChecked) {
            selected = selected.concat(selectedAasList ? selectedAasList : [], [aasId]);
            selected = [...new Set(selected)];
        } else if (!isChecked && selectedAasList) {
            selected = selectedAasList.filter((aas) => {
                return aas !== aasId;
            });
        } else {
            return;
        }

        setSelectedAasList(selected);
    };

    return (
        <>
            {env.COMPARISON_FEATURE_FLAG && (
                <CompareAasListHeader selectedAasList={selectedAasList} updateSelectedAasList={updateSelectedAasList}/>
            )}
            {isLoadingList && <CenteredLoadingSpinner sx={{ mt: 10 }} />}
            {!isLoadingList && aasListFiltered && (
                <>
                <Box>
                    <SelectProductType aasList={aasList} setAasListFiltered={setAasListFiltered}/>
                </Box>
                    <AasList shells={aasListFiltered} selectedAasList={selectedAasList} updateSelectedAasList={updateSelectedAasList}/>
                </>
            )}
        </>
    );
};