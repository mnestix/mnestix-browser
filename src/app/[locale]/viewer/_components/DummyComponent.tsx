'use client'

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

export function DummyComponent() {
    const t = useTranslations('submodels.timeSeries');

    return (
        <Box data-testid="test-text">
            {t('linkedSegments')}
        </Box>
    )
}