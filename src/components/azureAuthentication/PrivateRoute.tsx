import { Box, Typography } from '@mui/material';
import SignInButton from '../azureAuthentication/SignInButton';
import AuthenticationLock from 'assets/authentication_lock.svg';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import React from 'react';
import { useAuth } from 'lib/hooks/UseAuth';
import { useEnv } from 'app/env/provider';

export function PrivateRoute({ children }: { children: React.JSX.Element }) {
    const auth = useAuth();
    const env = useEnv();
    const useAuthentication = env.AUTHENTICATION_FEATURE_FLAG;

    return (
        <>
            {!useAuthentication || auth.isLoggedIn ? (
                <>{children}</>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            width: '100%',
                            m: 3,
                            mt: 5,
                        }}
                    >
                        <Typography variant="h2" sx={{ mb: 2 }} color="primary" align="center">
                            <FormattedMessage {...messages.mnestix.authenticationNeeded} />
                        </Typography>
                        <AuthenticationLock />
                        <SignInButton />
                    </Box>
                </>
            )}
        </>
    );
}
