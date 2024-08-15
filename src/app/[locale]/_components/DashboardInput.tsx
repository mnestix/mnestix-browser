'use client';
import { Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { ManualAASViewerInput } from '../viewer/_components/ManualAasViewerInput';
import { QrScanner } from 'app/[locale]/_components/QrScanner';
import { handleSearchForAas } from 'lib/searchUtilActions/search';
import { useRouter } from 'next/navigation';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';

export const DashboardInput = () => {
    
    const [, setAas] = useAasState();
    const [, setRegistryAasData] = useRegistryAasState();
    const navigate = useRouter();

    const browseAasUrl = async (val: string) => {
        const aasSearch = await handleSearchForAas(val);

        if (aasSearch.aas){
            setAas(aasSearch.aas);
            setRegistryAasData(aasSearch.aasData);
        }
        navigate.push(aasSearch.aasUrl);
    };

    return (
        <>
            <Typography color="text.secondary" textAlign="center">
                <FormattedMessage {...messages.mnestix.scanAasId} />
            </Typography>
            <QrScanner onScan={browseAasUrl} size={250} />
            <Typography color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                <FormattedMessage {...messages.mnestix.orEnterManual} />:
            </Typography>
            <ManualAASViewerInput />
        </>
    );
};
