'use client'

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

export function DummyComponent() {
    const t = useTranslations('submodels.timeSeries');

    return (
        <Box>
            {t('linkedSegments')}
        </Box>
    )
}