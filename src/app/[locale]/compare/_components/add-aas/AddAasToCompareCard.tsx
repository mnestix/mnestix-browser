import { Box, Card, CardContent, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import ScannerLogo from 'assets/ScannerLogo.svg';
import { useTheme } from '@mui/material/styles';

type AddAasToCompareCardProps = {
    onClick: () => void;
    isFirst?: boolean;
};

export function AddAasToCompareCard(props: AddAasToCompareCardProps) {
    const isFirst = props.isFirst !== undefined ? props.isFirst : false;
    const theme = useTheme();

    return (
        <Box
            width="33%"
            display="flex"
            onClick={props.onClick}
            sx={{ cursor: 'pointer' }}
            data-testid="add-aas-to-compare-button"
        >
            <Card>
                <CardContent>
                    {isFirst ? (
                        <Typography variant="h2" textAlign="center" margin="30px 0">
                            <FormattedMessage {...messages.mnestix.compare.addFirstAasButton} />
                        </Typography>
                    ) : (
                        <Typography variant="h2" textAlign="center" margin="30px 0">
                            <FormattedMessage {...messages.mnestix.compare.addButton} />
                        </Typography>
                    )}
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px',
                        }}
                    >
                        <ScannerLogo alt="Scanner Logo" style={{ color: theme.palette.primary.main }} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
