import {
    Box,
    Checkbox, Chip,
    Paper, styled,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography, useTheme
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "lib/i18n/localization";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { ShellIcon } from "components/custom-icons/ShellIcon";
import { tooltipText } from "app/[locale]/list/_components/lib/AasUtils";
import { ProductClassChip } from "app/[locale]/list/_components/ProductClassChip";
import { getProductClassId } from "lib/util/ProductClassResolverUtil";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import { useEnv } from "app/env/provider";
import { AasListEntry } from "lib/api/generated-api/clients.g";
import { useNotificationSpawner } from "lib/hooks/UseNotificationSpawner";
import { encodeBase64 } from "lib/util/Base64Util";
import { useAasState } from "components/contexts/CurrentAasContext";
import { useRouter } from "next/navigation";


type AasListProps = {
    shells: AasListEntry[],
    selectedAasList: string[] | undefined,
    updateSelectedAasList:  (isChecked: boolean, aasId: string | undefined) => void;
}

const tableBodyText = {
    lineHeight: '150%',
    fontSize: '16px',
    color: 'text.primary',
};

const StyledImage = styled('img')(() => ({
    maxHeight: '88px',
    maxWidth: '88px',
    width: '100%',
    objectFit: 'scale-down',
}));


export const AasList = (props: AasListProps) => {
    const { shells, selectedAasList, updateSelectedAasList } = props;
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const env = useEnv();
    const theme = useTheme();
    const [, setAas] = useAasState();
    const navigate = useRouter();
    const MAX_SELECTED_ITEMS = 3;
    
    
    /**
     * Decides if the current checkbox should be disabled or not.
     */
    const checkBoxDisabled = (aasId: string | undefined) => {
        if (!aasId) return false;
        return selectedAasList && selectedAasList.length >= MAX_SELECTED_ITEMS && !selectedAasList.includes(aasId);
    };

    /**
     * Shows a warning, indicating that no more aas can be selected.
     */
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
    
    const translateListText = (property: { [key: string]: string } | undefined) => {
        if (!property) return '';
        return property[intl.locale] ?? Object.values(property)[0] ?? '';
    };

    const navigateToAas = (listEntry: AasListEntry) => {
        setAas(null);
        if (listEntry.aasId) navigate.push(`/viewer/${encodeBase64(listEntry.aasId)}`);
    };
    
    return(
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow
                        sx={{
                            color: 'primary',
                            lineHeight: '150%',
                            letterSpacing: '0.16px',
                            fontSize: '16px',
                        }}
                    >
                        {env.COMPARISON_FEATURE_FLAG && (
                            <TableCell align="center" width="50px">
                                <Tooltip
                                    title={<FormattedMessage {...messages.mnestix.aasList.compareTooltip} />}
                                    arrow
                                >
                                    <CompareArrowsIcon
                                        sx={{ width: '35px', height: '35px', verticalAlign: 'middle' }}
                                    />
                                </Tooltip>
                            </TableCell>
                        )}
                        <TableCell>
                            <Typography fontWeight="bold">
                                <FormattedMessage {...messages.mnestix.aasList.picture} />
                            </Typography>
                        </TableCell>
                        <TableCell align="left">
                            <Typography fontWeight="bold">
                                <FormattedMessage {...messages.mnestix.aasList.manufacturerHeading} />
                            </Typography>
                        </TableCell>
                        <TableCell align="left">
                            <Typography fontWeight="bold">
                                <FormattedMessage {...messages.mnestix.aasList.productDesignationHeading} />
                            </Typography>
                        </TableCell>
                        <TableCell align="left">
                            <Typography fontWeight="bold">
                                <FormattedMessage {...messages.mnestix.aasList.assetIdHeading} /> /{' '}
                                <FormattedMessage {...messages.mnestix.aasList.aasIdHeading} />
                            </Typography>
                        </TableCell>
                        <TableCell align="left">
                            <Typography fontWeight="bold">
                                <FormattedMessage {...messages.mnestix.aasList.productClassHeading} />
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {shells?.map((aasListEntry) => (
                        <TableRow
                            key={aasListEntry.aasId}
                            sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                backgroundColor: theme.palette?.common?.white,
                            }}
                            data-testid={`list-row-${aasListEntry.aasId}`}
                        >
                            {env.COMPARISON_FEATURE_FLAG && (
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
                                    100,
                                )}
                            </TableCell>
                            <TableCell align="left" sx={tableBodyText}>
                                <Typography fontWeight="bold" sx={{ letterSpacing: '0.16px' }}>
                                    <FormattedMessage {...messages.mnestix.aasList.assetIdHeading} />
                                </Typography>
                                {tooltipText(aasListEntry.assetId, 100)} <br />
                                <Typography fontWeight="bold" sx={{ letterSpacing: '0.16px' }}>
                                    <FormattedMessage {...messages.mnestix.aasList.aasIdHeading} />
                                </Typography>
                                {tooltipText(aasListEntry.aasId, 100)}
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}