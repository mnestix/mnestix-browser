import { Box, Checkbox, Chip, Paper, styled, TableCell, Typography } from "@mui/material";
import { ShellIcon } from "components/custom-icons/ShellIcon";
import { tooltipText } from "app/[locale]/list/_components/lib/AasUtils";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "lib/i18n/localization";
import { ProductClassChip } from "app/[locale]/list/_components/ProductClassChip";
import { getProductClassId } from "lib/util/ProductClassResolverUtil";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import { AasListEntry } from "lib/api/generated-api/clients.g";
import { encodeBase64 } from "lib/util/Base64Util";
import { useRouter } from "next/navigation";
import { useAasState } from "components/contexts/CurrentAasContext";
import { useNotificationSpawner } from "lib/hooks/UseNotificationSpawner";

type AasTableRow = {
    aasListEntry: AasListEntry;
    comparisonFeatureFlag: boolean | undefined;
    checkBoxDisabled: (aasId: string | undefined) => boolean | undefined;
    selectedAasList: string[] | undefined;
    updateSelectedAasList: (isChecked: boolean, aasId: string | undefined) => void;
}

const StyledImage = styled('img')(() => ({
    maxHeight: '88px',
    maxWidth: '88px',
    width: '100%',
    objectFit: 'scale-down',
}));

const tableBodyText = {
    lineHeight: '150%',
    fontSize: '16px',
    color: 'text.primary',
};
export const AasTableRow = (props: AasTableRow) => {
    const {aasListEntry, comparisonFeatureFlag, checkBoxDisabled, selectedAasList, updateSelectedAasList} = props;
    const navigate = useRouter();
    const intl = useIntl();
    const [, setAas] = useAasState();
    const notificationSpawner = useNotificationSpawner();
    const navigateToAas = (listEntry: AasListEntry) => {
        setAas(null);
        if (listEntry.aasId) navigate.push(`/viewer/${encodeBase64(listEntry.aasId)}`);
    };

    const translateListText = (property: { [key: string]: string } | undefined) => {
        if (!property) return '';
        return property[intl.locale] ?? Object.values(property)[0] ?? '';
    };

    const showMaxElementsNotification = () => {
        notificationSpawner.spawn({
            message: (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    <FormattedMessage {...messages.mnestix.aasList.maxElementsWarning} />
                </Typography>
            ),
            severity: 'warning',
        });
    };
    
    return (
        <>
        {comparisonFeatureFlag && (
            <TableCell align="center" sx={tableBodyText}>
                <Box
                    component="span"
                    onClick={() => {
                        if (checkBoxDisabled(aasListEntry.aasId))
                            showMaxElementsNotification();
                    }}
                >
                    <Checkbox
                        checked={
                            !!(
                                selectedAasList &&
                                selectedAasList.some((el) => el == aasListEntry.aasId)
                            )
                        }
                        disabled={checkBoxDisabled(aasListEntry.aasId)}
                        onChange={(evt) =>
                            updateSelectedAasList(evt.target.checked, aasListEntry.aasId)
                        }
                        data-testid="list-checkbox"
                    />
                </Box>
            </TableCell>
        )}
        <TableCell component="th" scope="row" sx={tableBodyText}>
            <Paper
                onClick={() => navigateToAas(aasListEntry)}
                sx={{
                    width: '88px',
                    height: '88px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                        boxShadow: 6,
                        cursor: 'pointer',
                    },
                }}
                data-testid="list-thumbnail"
            >
                {aasListEntry.thumbnailUrl ? (
                    <StyledImage src={aasListEntry.thumbnailUrl} />
                ) : (
                    <ShellIcon fontSize="large" color="primary" />
                )}
            </Paper>
        </TableCell>
        <TableCell align="left" sx={tableBodyText}>
            {translateListText(aasListEntry.manufacturerName)}
        </TableCell>
        <TableCell align="left" sx={tableBodyText}>
            {tooltipText(
                translateListText(aasListEntry.manufacturerProductDesignation),
                80,
            )}
        </TableCell>
        <TableCell align="left" sx={tableBodyText}>
            <Typography fontWeight="bold" sx={{ letterSpacing: '0.16px' }}>
                <FormattedMessage {...messages.mnestix.aasList.assetIdHeading} />
            </Typography>
            {tooltipText(aasListEntry.assetId, 80)} <br />
            <Typography fontWeight="bold" sx={{ letterSpacing: '0.16px' }}>
                <FormattedMessage {...messages.mnestix.aasList.aasIdHeading} />
            </Typography>
            {tooltipText(aasListEntry.aasId, 80)}
        </TableCell>
        <TableCell align="left">
            {aasListEntry.productGroup ? (
                <ProductClassChip  productClassId={getProductClassId(aasListEntry.productGroup)} maxChars={25}/>
            ) : (
                <Chip
                    sx={{ paddingX: '16px', paddingY: '6px' }}
                    color={'primary'}
                    label={<FormattedMessage {...messages.mnestix.aasList.notAvailable} />}
                    variant="outlined"
                    icon={<LabelOffIcon color={'primary'} />}
                    data-testid="product-class-chip"
                />
            )}
        </TableCell>
    </>)
}