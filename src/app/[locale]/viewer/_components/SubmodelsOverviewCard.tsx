import { Box, Card, CardContent, Divider, Skeleton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';
import { SubmodelDetail } from './submodel/SubmodelDetail';
import { Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { SubmodelSorting } from 'app/[locale]/viewer/_components/submodel/sorting/SubmodelSorting';
import { TabSelectorItem, VerticalTabSelector } from 'components/basics/VerticalTabSelector';
import { MobileModal } from 'components/basics/MobileModal';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { getSubmodelFromSubmodelDescriptor } from 'lib/services/searchUtilActions/searchServer';
import { useEnv } from 'app/env/provider';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { performSearchSubmodelFromAllRepos } from 'lib/services/multipleDataSourceActions/multipleDataSourceActions';

export type SubmodelsOverviewCardProps = { readonly smReferences?: Reference[]; readonly isLoading?: boolean };

export function SubmodelsOverviewCard(props: SubmodelsOverviewCardProps) {
    const [selectedItem, setSelectedItem] = useState<TabSelectorItem>();
    const [selectedSubmodel, setSelectedSubmodel] = useState<Submodel>();
    const { submodelClient } = useApis();
    const [registryAasData] = useRegistryAasState();
    const { submodelRegistryServiceClient } = useApis();
    const notificationSpawner = useNotificationSpawner();

    SubmodelSorting(selectedSubmodel);

    const [submodelSelectorItems, setSubmodelSelectorItems] = useState<TabSelectorItem[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const isMobile = useIsMobile();
    const firstSubmodelIdShort = 'Nameplate';
    const env = useEnv();

    async function fetchSubmodelFromRepo(reference: Reference): Promise<Submodel | undefined> {
        const id = reference.keys[0].value;

        try {
            let fetchedSubmodelData: Submodel;
            try {
                fetchedSubmodelData = await submodelClient.getSubmodelById(id);
            } catch (e) {
                fetchedSubmodelData = await performSearchSubmodelFromAllRepos(id);
            }
            return fetchedSubmodelData;
        } catch (e) {
            console.error(e);
            showError(e, notificationSpawner);
            return undefined;
        }
    }

    function sortSubmodelSelectorTabs() {
        if (submodelSelectorItems) {
            submodelSelectorItems.sort(function (x, y) {
                return x.label == firstSubmodelIdShort ? -1 : y.label == firstSubmodelIdShort ? 1 : 0;
            });
        }
    }

    async function fetchSubmodels() {
        let submodelsPromise;

        if (registryAasData && registryAasData.submodelDescriptors) {
            // Fetch submodel from provided endpoint
            submodelsPromise = Promise.all(
                registryAasData.submodelDescriptors.map(async (submodelDescriptor): Promise<TabSelectorItem | null> => {
                    const endpoint = submodelDescriptor?.endpoints[0].protocolInformation.href;

                    if (endpoint) {
                        const submodelData = await getSubmodelFromSubmodelDescriptor(endpoint);
                        return {
                            id: submodelDescriptor.id,
                            label: submodelDescriptor.idShort ?? '',
                            submodelData: submodelData,
                        };
                    }
                    return null;
                }),
            );
        } else {
            // Search in default registry
            submodelsPromise = Promise.all(
                (props.smReferences as Reference[]).map(async (reference): Promise<TabSelectorItem | null> => {
                    let tabSelectorItem: TabSelectorItem | null = null;
                    try {
                        const submodelDescriptor = env.SUBMODEL_REGISTRY_API_URL
                            ? await submodelRegistryServiceClient.getSubmodelDescriptorsById(reference.keys[0].value)
                            : null;
                        const endpoint = submodelDescriptor?.endpoints[0].protocolInformation.href;

                        if (endpoint) {
                            const submodelData = await getSubmodelFromSubmodelDescriptor(endpoint);
                            tabSelectorItem = {
                                id: submodelDescriptor.id,
                                label: submodelDescriptor.idShort ?? '',
                                submodelData: submodelData,
                            };
                        }
                    } catch (e) {
                        if (!(e instanceof TypeError || (e instanceof Response && e.status === 404))) {
                            console.error(e);
                        }
                    }

                    if (!tabSelectorItem) {
                        // Submodel registry is not available or submodel not found there -> search in repo
                        const fetchedSubmodel = await fetchSubmodelFromRepo(reference);

                        if (!fetchedSubmodel) return null;

                        tabSelectorItem = {
                            id: fetchedSubmodel.id,
                            label: fetchedSubmodel.idShort ?? '',
                            submodelData: fetchedSubmodel,
                        };
                    }

                    return tabSelectorItem;
                }),
            );
        }

        const submodels = (await submodelsPromise) as TabSelectorItem[];
        setSubmodelSelectorItems(submodels.filter((item) => !!item));
    }

    useAsyncEffect(async () => {
        if (!props.smReferences) return;

        await fetchSubmodels();
        sortSubmodelSelectorTabs();
    }, [props.smReferences, registryAasData]);

    useEffect(() => {
        setOpen(!!selectedItem && isMobile);
    }, [isMobile, selectedItem]);

    useEffect(() => {
        setSelectedItem(isMobile ? undefined : submodelSelectorItems?.[0]);
    }, [isMobile, submodelSelectorItems]);

    useAsyncEffect(async () => {
        const selectedSubmodel = submodelSelectorItems?.find((el) => el.id === selectedItem?.id)?.submodelData;

        if (selectedSubmodel) {
            setSelectedSubmodel(selectedSubmodel);
        }
    }, [selectedItem]);

    const handleClose = () => {
        setOpen(false);
        setSelectedItem(undefined);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h3" marginBottom="15px">
                    <FormattedMessage {...messages.mnestix.submodels} />
                </Typography>
                <Box display="grid" gridTemplateColumns={isMobile ? '1fr' : '1fr 2fr'} gap="40px">
                    {props.isLoading && !props.smReferences ? (
                        <>
                            <Box>
                                {[0, 1, 2].map((i) => {
                                    return <Skeleton variant="rectangular" key={i} height={50} sx={{ mb: 2 }} />;
                                })}
                            </Box>
                            <Box>
                                {[0, 1, 2].map((i) => {
                                    return (
                                        <Box sx={{ mb: 2 }} key={i}>
                                            <Skeleton variant="text" width="50%" />
                                            <Skeleton variant="text" width="30%" />
                                            {i < 2 && <Divider sx={{ mt: 2 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </>
                    ) : (
                        <>
                            <VerticalTabSelector
                                items={submodelSelectorItems}
                                selected={selectedItem}
                                setSelected={setSelectedItem}
                            />
                            {isMobile ? (
                                <MobileModal
                                    title={submodelSelectorItems.find((i) => i.id === selectedItem?.id)?.label}
                                    open={open}
                                    handleClose={handleClose}
                                    content={<SubmodelDetail submodel={selectedSubmodel} />}
                                />
                            ) : (
                                <SubmodelDetail submodel={selectedSubmodel} />
                            )}
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
