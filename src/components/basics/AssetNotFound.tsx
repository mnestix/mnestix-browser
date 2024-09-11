'use client';
import { Box, Button, Typography } from '@mui/material';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/navigation';

type AssetNotFoundProps = {
    id?: string | null;
};

export default function AssetNotFound(props: AssetNotFoundProps) {
    const { id } = props;
    const navigate = useRouter();

    return (
        <>
            <Typography variant="h1" color="primary" align="center" sx={{ mt: 2 }}>
                <FormattedMessage {...messages.mnestix.cannotLoadAasId.header} />
            </Typography>
            <Typography align="center" sx={{ mt: 2 }}>
                <FormattedMessage {...messages.mnestix.cannotLoadAasId.text} values={{ id: id }} />
                <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate.push('/')}>
                        <FormattedMessage {...messages.mnestix.toHome} />
                    </Button>
                </Box>
            </Typography>
        </>
    );
}
