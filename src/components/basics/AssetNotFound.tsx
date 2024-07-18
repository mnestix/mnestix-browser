'use client';
import { Box, Button, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/navigation';

type AssetNotFoundProps = {
    assetId?: string;
};

export default function AssetNotFound(props: AssetNotFoundProps) {
    const { assetId } = props;
    const navigate = useRouter();

    return (
        <>
            <Typography variant="h1" color="primary" align="center" sx={{ mt: 2 }}>
                <FormattedMessage {...messages.mnestix.cannotLoadAasId.header} />
            </Typography>
            <Typography align="center" sx={{ mt: 2 }}>
                <FormattedMessage {...messages.mnestix.cannotLoadAasId.text} values={{ assetId: assetId }} />
                <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate.push('/')}>
                        <FormattedMessage {...messages.mnestix.toHome} />
                    </Button>
                </Box>
            </Typography>
        </>
    );
}
