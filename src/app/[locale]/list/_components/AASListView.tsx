'use client';
import { useRouter } from 'next/navigation';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import { useEnv } from 'app/env/provider';
import { useEffect, useState } from 'react';
import { AasListEntry } from 'lib/api/generated-api/clients.g';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { FormattedMessage, useIntl } from 'react-intl';
import { getProductClassId, parseProductClassFromString, ProductClass } from 'lib/util/ProductClassResolverUtil';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Checkbox,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { ShellIcon } from 'components/custom-icons/ShellIcon';
import { encodeBase64 } from 'lib/util/Base64Util';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import LabelIcon from '@mui/icons-material/Label';
import { messages } from 'lib/i18n/localization';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { useAasState } from 'components/contexts/CurrentAasContext';
import { AASCard } from './AASCard';

const StyledImage = styled('img')(() => ({
    maxHeight: '88px',
    maxWidth: '88px',
    width: '100%',
    objectFit: 'scale-down',
}));

/**
 * Shortens the property text and provides the full text in a tooltip.
 */
export const tooltipText = (property: string | undefined, maxChars: number) => {
    if (!property) return '';
    else {
        return property.length > maxChars ? (
            <Tooltip title={property} arrow>
                <Box component="span">{`${property.slice(0, maxChars)} (...)`}</Box>
            </Tooltip>
        ) : (
            <>{property}</>
        );
    }
};

export const translateListText = (property: { [key: string]: string } | undefined) => {
    const intl = useIntl();
    if (!property) return '';
    return property[intl.locale] ?? Object.values(property)[0] ?? '';
};

/**
 * Returns a chip component adjusted for product class element
 */
export const productClassValue = (productClassId: string | null, maxChars: number) => {
    const intl = useIntl();
    if (!productClassId) return '';
    let productClass;
    try {
        productClass = parseProductClassFromString(
            productClassId,
            intl.formatMessage(messages.mnestix.aasList.productClasses[productClassId]),
        );
    } catch (e) {
        console.warn('Invalid product type', e);
    }
    if (!productClass) {
        productClass = parseProductClassFromString(productClassId, productClassId);
    }
    return (
        <Chip
            sx={{ paddingX: '16px', paddingY: '6px' }}
            color={'primary'}
            label={tooltipText(productClass.description, maxChars)}
            variant="outlined"
            icon={getProductClassIcon(productClass.type)}
            data-testid="product-class-chip"
        />
    );
};

/**
 * Returns an icon component based on the provided product class type.
 * @param productClassType - product class type
 */
const getProductClassIcon = (productClassType: string) => {
    switch (productClassType) {
        case 'pneumatics':
            return <TireRepairIcon color={'primary'} />;
        case 'hydraulics':
            return <FireHydrantAltIcon color={'primary'} />;
        default:
            return <LabelIcon color={'primary'} />;
    }
};

export const AASListView = () => {
    const { aasListClient } = useApis();
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [aasList, setAasList] = useState<AasListEntry[]>();
    const [aasListFiltered, setAasListFiltered] = useState<AasListEntry[]>();
    const [productClassFilterValue, setProductClassFilterValue] = useState<string>('');
    const [selectedAasList, setSelectedAasList] = useState<string[]>();
    const [productClass, setProductClass] = useState<ProductClass[]>([]);
    const notificationSpawner = useNotificationSpawner();
    const intl = useIntl();
    const navigate = useRouter();
    const theme = useTheme();
    const env = useEnv();
    const [, setAas] = useAasState();
    const MAX_SELECTED_ITEMS = 3;

    useAsyncEffect(async () => {
        try {
            setIsLoadingList(true);
            const list = await aasListClient.getAasListEntries();
            setAasList(list);
            if (!productClassFilterValue) setAasListFiltered(list);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    /**
     * Creates the ProductClass Filter values.
     */
    // useEffect(() => {
    //     const productClasses: ProductClass[] = [];
    //     if (aasList) {
    //         aasList.forEach((aas) => {
    //             if (!aas.productGroup) return;
    //             const productClassId = getProductClassId(aas.productGroup);
    //             let productClassString;
    //             try {
    //                 productClassString = intl.formatMessage(messages.mnestix.aasList.productClasses[productClassId]);
    //             } catch (e) {
    //                 console.warn('Invalid product type', e);
    //             }
    //             if (!productClassString) {
    //                 productClassString = getProductClassId(aas.productGroup);
    //             }
    //             const productClass = parseProductClassFromString(productClassId, productClassString);
    //             if (!productClasses.find((element) => element.id === productClass.id)) {
    //                 productClasses.push(productClass);
    //             }
    //         });
    //     }
    //     setProductClass(productClasses);
    // }, [aasList]);

    const navigateToAas = (listEntry: AasListEntry) => {
        setAas(null);
        if (listEntry.aasId) navigate.push(`/viewer/${encodeBase64(listEntry.aasId)}`);
    };

    const navigateToCompare = () => {
        const encodedAasList = selectedAasList?.map((aasId) => {
            return encodeURIComponent(aasId);
        });
        const searchString = encodedAasList?.join('&aasId=');
        navigate.push(`/compare?aasId=${searchString}`);
    };

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

    /**
     * Applies product filter change to the list.
     * @param event
     */
    // const handleFilterChange = (event: SelectChangeEvent) => {
    //     setProductClassFilterValue(event.target.value);
    //     if (!aasList) return;
    //     if (event.target.value === '') {
    //         setAasListFiltered(aasList);
    //     } else {
    //         const filteredList = aasList.filter((aas) => {
    //             return aas.productGroup && aas.productGroup.startsWith(event.target.value);
    //         });
    //         setAasListFiltered(filteredList);
    //     }
    // };
    // const SelectProductType = () => {
    //     return (
    //         <FormControl variant="standard" sx={{ minWidth: 120, marginTop: '16px', width: '265px' }}>
    //             <InputLabel id="product-select">
    //                 <FormattedMessage {...messages.mnestix.aasList.productClassHeading} />
    //             </InputLabel>
    //             <Select
    //                 labelId="product-select"
    //                 value={productClassFilterValue}
    //                 label={<FormattedMessage {...messages.mnestix.aasList.productClassHeading} />}
    //                 data-testid="product-class-select"
    //                 onChange={handleFilterChange}
    //             >
    //                 <MenuItem value="" data-testid="product-class-select-all">
    //                     <FormattedMessage {...messages.mnestix.aasList.showAll} />
    //                 </MenuItem>
    //                 {productClass.map((productType) => {
    //                     return (
    //                         <MenuItem
    //                             key={productType.id}
    //                             value={productType.id}
    //                             data-testid={`product-class-select-${productType.description.replace(' ', '-')}`}
    //                         >
    //                             <Typography display="flex" justifyItems="center">
    //                                 {getProductClassIcon(productType.type)}
    //                                 <Box component="span" sx={{ marginLeft: '5px' }}>
    //                                     {tooltipText(productType.description, 25)}
    //                                 </Box>
    //                             </Typography>
    //                         </MenuItem>
    //                     );
    //                 })}
    //             </Select>
    //         </FormControl>
    //     );
    // };

    const tableBodyText = {
        lineHeight: '150%',
        fontSize: '16px',
        color: 'text.primary',
    };

    /**
     * Update the list of currently selected aas
     */
    const updateSelectedAasList = (isChecked: boolean, aasId: string | undefined) => {
        if (!aasId) return;
        let selected: string[] = [];

        if (isChecked) {
            selected = selected.concat(selectedAasList ? selectedAasList : [], [aasId]);
            selected = [...new Set(selected)];
        } else if (!isChecked && selectedAasList) {
            selected = selectedAasList.filter((aas) => {
                return aas !== aasId;
            });
        } else {
            return;
        }

        setSelectedAasList(selected);
    };

    return (
        <>
            {/* TODO: implement checkbox */}
            {/* {env.COMPARISON_FEATURE_FLAG && (
                <>
                    <Typography marginBottom={3}>
                        <FormattedMessage {...messages.mnestix.aasList.subtitle} />
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        {selectedAasList?.map((selectedAas) => (
                            <Box display="flex" flexDirection="row" alignItems="center" key={selectedAas}>
                                <Typography data-testid={`selected-${selectedAas}`}>
                                    {tooltipText(selectedAas, 15)}
                                </Typography>
                                <IconButton onClick={() => updateSelectedAasList(false, selectedAas)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            variant="contained"
                            onClick={navigateToCompare}
                            disabled={!selectedAasList || selectedAasList.length < 1}
                            data-testid="compare-button"
                        >
                            <FormattedMessage {...messages.mnestix.aasList.goToCompare} />
                        </Button>
                    </Box>
                    <Box>
                        <SelectProductType />
                    </Box>
                </>
            )} */}
            {isLoadingList && <CenteredLoadingSpinner sx={{ mt: 10 }} />}
            {!isLoadingList && aasListFiltered && (
                <Grid container spacing={2} sx={{ marginTop: '16px' }}>
                    {aasListFiltered?.map((aasListEntry) => (
                        <AASCard aasListEntry={aasListEntry} navigateToAas={navigateToAas} key={aasListEntry.aasId} />
                    ))}
                </Grid>
            )}

            {/* {selectedAasList && selectedAasList.length > 0 && (
                <Box sx={{ marginTop: '16px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CompareArrowsIcon />}
                        onClick={navigateToCompare}
                        disabled={selectedAasList.length < 2}
                    >
                        <FormattedMessage {...messages.mnestix.aasList.compareTooltip} />
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<CloseIcon />}
                        onClick={() => {}}
                        sx={{ marginLeft: '8px' }}
                    >
                        clear selection
                    </Button>
                </Box>
            )} */}
        </>
    );
};
