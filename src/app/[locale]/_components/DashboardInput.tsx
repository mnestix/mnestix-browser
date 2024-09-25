'use client';
import { Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { ManualAasInput } from 'app/[locale]/_components/ManualAasInput';
import { QrScanner } from 'app/[locale]/_components/qrScanner/QrScanner';
import { useRouter } from 'next/navigation';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { LocalizedError } from 'lib/util/LocalizedError';
import { performFullAasSearch } from 'lib/services/searchUtilActions/searchActions';

export const DashboardInput = () => {
    const [, setAas] = useAasState();
    const [, setRegistryAasData] = useRegistryAasState();
    const navigate = useRouter();

    const browseAasUrl = async (val: string) => {
        try {
            const aasSearch = await performFullAasSearch(val);

            if (aasSearch.aas) {
                setAas(aasSearch.aas);
                setRegistryAasData(aasSearch.aasData);
            }
            navigate.push(aasSearch.redirectUrl);
        } catch (e) {
            throw new LocalizedError(messages.mnestix.aasUrlNotFound);
        }
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
            <ManualAasInput onSubmit={browseAasUrl} />
        </>
    );
};
