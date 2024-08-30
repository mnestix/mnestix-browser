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
import { getSubmodelFromSubmodelDescriptor } from 'lib/searchUtilActions/searchServer';
import { useEnv } from 'app/env/provider';
import { getSubmodelFromAllRepos } from 'lib/searchUtilActions/SearchRepositoryHelper';

export type SubmodelsOverviewCardProps = { readonly smReferences?: Reference[]; readonly isLoading?: boolean };

export function SubmodelsOverviewCard(props: SubmodelsOverviewCardProps) {
    const [selectedItem, setSelectedItem] = useState<TabSelectorItem>();
    const [selectedSubmodel, setSelectedSubmodel] = useState<Submodel>();
    const { submodelClient } = useApis();
    const [registryAasData] = useRegistryAasState();
    const { submodelRegistryServiceClient } = useApis();

    SubmodelSorting(selectedSubmodel);

    const [items, setItems] = useState<TabSelectorItem[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const isMobile = useIsMobile();
    const firstSubmodelIdShort = 'Nameplate';
    const env = useEnv();

    useAsyncEffect(async () => {
        if (!props.smReferences) return;

        const submodels: { id: string; label: string; metadata?: Submodel; endpoint?: string }[] = [];

        async function fetchSubmodelFromRepo(reference: Reference) {
            const id = reference.keys[0].value;
            try {
                const fetchedSubmodel = await getSubmodelFromAllRepos(id, submodelClient);
                submodels.push({ id, label: fetchedSubmodel.idShort ?? '', metadata: fetchedSubmodel });
            } catch (e) {
                console.warn(e);
            }
        }

        if (registryAasData) {
            registryAasData.submodelDescriptors?.forEach((submodelDescriptor) => {
                submodels.push({
                    id: submodelDescriptor.id,
                    label: submodelDescriptor.idShort ?? '',
                    endpoint: submodelDescriptor.endpoints[0].protocolInformation.href,
                });
            });
        } else {
            for (const reference of props.smReferences as Reference[]) {
                try {
                    const submodelFromRegistry = env.SUBMODEL_REGISTRY_API_URL
                        ? await submodelRegistryServiceClient.getSubmodelDescriptorsById(reference.keys[0].value)
                        : null;
                    submodels.push({
                        id: submodelFromRegistry.id,
                        label: submodelFromRegistry.idShort ?? '',
                        endpoint: submodelFromRegistry.endpoints[0].protocolInformation.href,
                    });
                } catch (e) {
                    // Submodel registry is not available or submodel not found there -> search in repo
                    if (e instanceof TypeError || (e instanceof Response && e.status === 404)) {
                        await fetchSubmodelFromRepo(reference);
                    } else {
                        console.error(e);
                    }
                }
            }
        }

        if (submodels) {
            submodels.sort(function (x, y) {
                return x.label == firstSubmodelIdShort ? -1 : y.label == firstSubmodelIdShort ? 1 : 0;
            });
            setItems(submodels);
        }
    }, [props.smReferences, registryAasData]);

    useEffect(() => {
        setOpen(!!selectedItem && isMobile);
    }, [isMobile, selectedItem]);

    useEffect(() => {
        setSelectedItem(isMobile ? undefined : items?.[0]);
    }, [isMobile, items]);

    useAsyncEffect(async () => {
        const selectedSubmodel = items?.find((el) => el.id === selectedItem?.id);
        let fetchedSubmodel;

        if (selectedSubmodel) {
            if (selectedSubmodel.endpoint) {
                try {
                    fetchedSubmodel = await getSubmodelFromSubmodelDescriptor(selectedSubmodel.endpoint);
                } catch (_) {
                    // expexted behaviour if submodel registry is not available or submodel is not found there
                }
            }

            if (!registryAasData && !fetchedSubmodel) {
                try {
                    try {
                        fetchedSubmodel = await submodelClient.getSubmodelById(selectedSubmodel?.id);
                    } catch (e) {
                        fetchedSubmodel = await getSubmodelFromAllRepos(selectedSubmodel?.id, submodelClient);
                    }
                } catch (e) {
                    console.warn(e);
                }
            }
        }

        if (fetchedSubmodel) {
            setSelectedSubmodel(fetchedSubmodel);
        }
    }, [selectedItem, props.smReferences]);

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
                            <VerticalTabSelector items={items} selected={selectedItem} setSelected={setSelectedItem} />
                            {isMobile ? (
                                <MobileModal
                                    title={items.find((i) => i.id === selectedItem?.id)?.label}
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
