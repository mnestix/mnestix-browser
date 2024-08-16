import { Box, IconButton, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import CloseIcon from '@mui/icons-material/Close';
import { AASOverviewCard } from 'app/[locale]/viewer/_components/AASOverviewCard';
import { AddAasToCompareCard } from 'app/[locale]/compare/_components/add-aas/AddAasToCompareCard';
import { CompareSubmodelsAccordion } from 'app/[locale]/compare/_components/CompareSubmodelsAccordion';
import { CompareAasAddDialog } from 'app/[locale]/compare/_components/add-aas/CompareAasAddDialog';
import { useCompareAasContext } from 'components/contexts/CompareAasContext';
import { useEffect, useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { useSearchParams } from 'next/navigation';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { AasSearchResult, handleSearchForAas } from 'lib/searchUtilActions/search';
import { LocalizedError } from 'lib/util/LocalizedError';

export function CompareView() {
    const { compareAas, addSeveralAas, deleteAas, addAas } = useCompareAasContext();
    const [isLoadingAas, setIsLoadingAas] = useState(false);
    const notificationSpawner = useNotificationSpawner();
    const searchParams = useSearchParams();
    const aasIds = searchParams.getAll('aasId').map((aasId) => {
        return decodeURIComponent(aasId);
    });
    const [addModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        async function _fetchAas() {
            try {
                setIsLoadingAas(true);
                if (aasIds) {
                    addSeveralAas(aasIds);
                }
            } catch (e) {
                showError(e, notificationSpawner);
            } finally {
                setIsLoadingAas(false);
            }
        }

        _fetchAas().catch((reason) => {
            showError(reason, notificationSpawner);
        });
    }, []);

    const handleDetailsModalOpen = () => {
        setAddModalOpen(true);
    };

    const handleDetailsModalClose = () => {
        setAddModalOpen(false);
    };

    const handleDeleteAas = (aasId: string) => {
        deleteAas(aasId);
    };

    const handleAddAas = async (aasId: string) => {
        let aasSearch: AasSearchResult;
        try {
            aasSearch = await handleSearchForAas(aasId);
        } catch (e) {
            throw new LocalizedError(messages.mnestix.aasUrlNotFound);
        }

        if (!aasSearch.aas) {
            throw new LocalizedError(messages.mnestix.compare.moreAasFound);
        }

        const aasExists = compareAas.find((aas) => aas.id === aasSearch.aas!.id);
        if (aasExists) {
            throw new LocalizedError(messages.mnestix.compare.aasAlreadyAdded);
        }

        try {
            await addAas(aasSearch.aas!, aasSearch.aasData?.submodelDescriptors);
        } catch (e) {
            throw new LocalizedError(messages.mnestix.compare.aasAddError);
        }

        setAddModalOpen(false);
    };

    return (
        <>
            <Box width="90%" maxWidth="1125px" margin="0 auto">
                <Typography variant="h2" textAlign="left" marginBottom="30px">
                    <FormattedMessage {...messages.mnestix.compare.title} />
                </Typography>
                {compareAas.length !== 0 || isLoadingAas ? (
                    <Box display="flex" flexDirection="column" gap="20px">
                        <Box display="flex" flexDirection="row" gap="20px">
                            {compareAas.map((aas, index) => (
                                <Box position="relative" key={index} width={1 / 3} data-testid={`compare-aas-${index}`}>
                                    <IconButton
                                        aria-label="close"
                                        onClick={() => handleDeleteAas(aas.id)}
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            color: (theme) => theme.palette.grey[500],
                                            zIndex: 5,
                                        }}
                                        data-testid={`delete-compare-aas-${index}`}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                    <AASOverviewCard
                                        key={index}
                                        aas={aas}
                                        productImage={aas.assetInformation.defaultThumbnail?.path}
                                        isLoading={isLoadingAas}
                                        hasImage={!!aas.assetInformation?.defaultThumbnail?.path}
                                        isAccordion={true}
                                        imageLinksToDetail={true}
                                    />
                                </Box>
                            ))}
                            {compareAas.length < 3 && <AddAasToCompareCard onClick={handleDetailsModalOpen} />}
                        </Box>
                        <Box width={compareAas.length / 3}>
                            <CompareSubmodelsAccordion />
                        </Box>
                    </Box>
                ) : (
                    <>
                        <AddAasToCompareCard onClick={handleDetailsModalOpen} isFirst={true} />
                    </>
                )}
            </Box>
            <CompareAasAddDialog open={addModalOpen} onSubmit={handleAddAas} onClose={handleDetailsModalClose} />
        </>
    );
}
