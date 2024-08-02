'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useAasState, useRegistryAasState } from 'components/contexts/CurrentAasContext';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { decodeBase64, safeBase64Decode } from 'lib/util/Base64Util';
import { ArrowForward } from '@mui/icons-material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { AssetAdministrationShell, LangStringNameType, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { getTranslationText } from 'lib/util/SubmodelResolverUtil';
import { useRouter, useParams } from 'next/navigation';
import { SubmodelsOverviewCard } from '../_components/SubmodelsOverviewCard';
import { AASOverviewCard } from 'app/[locale]/viewer/_components/AASOverviewCard';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { useEnv } from 'app/env/provider';
import { handleAasRegistrySearch } from 'lib/searchUtilActions/search';

export default function Page() {
    const navigate = useRouter();
    const searchParams = useParams<{ base64AasId: string }>();
    const base64AasId = searchParams.base64AasId;
    const [submodels, setSubmodels] = useState<Reference[]>();
    const [productImage, setProductImage] = useState<string>();
    const [isLoadingAas, setIsLoadingAas] = useState(false);
    const [isLoadingSubmodels, setIsLoadingSubmodels] = useState(false);
    const [hasImage, setHasImage] = useState(true);
    const notificationSpawner = useNotificationSpawner();
    const isMobile = useIsMobile();
    const intl = useIntl();
    const env = useEnv();
    const { repositoryClient } = useApis();
    const [aas, setAas] = useAasState();
    const [, setRegistryAasData] = useRegistryAasState();

    useEffect(() => {
        async function _fetchAas() {
            try {
                setIsLoadingAas(true);
                if (aas === null) {
                    const aasIdDecoded = safeBase64Decode(base64AasId);
                    const registrySearchResult = await handleAasRegistrySearch(aasIdDecoded);
                    if (registrySearchResult != null) {
                        setAas(registrySearchResult.registryAas as AssetAdministrationShell);
                        setRegistryAasData({
                            submodelDescriptors: registrySearchResult?.registryAasData?.submodelDescriptors,
                            aasRegistryRepositoryOrigin:
                                registrySearchResult?.registryAasData?.aasRegistryRepositoryOrigin,
                        });
                        setAasData(registrySearchResult.registryAas as AssetAdministrationShell);
                    } else {
                        const shell = await repositoryClient.getAssetAdministrationShellById(base64AasId as string);
                        setAas(shell);
                        setAasData(shell);
                    }
                } else {
                    setAasData(aas);
                }
            } catch (e) {
                showError(e, notificationSpawner);
            } finally {
                setIsLoadingAas(false);
            }
        }

        _fetchAas();
    }, [base64AasId, env]);

    const setAasData = (shell: AssetAdministrationShell) => {
        const productImageString = shell.assetInformation?.defaultThumbnail?.path ?? '';
        if (productImageString) {
            setProductImage(productImageString);
        } else {
            setHasImage(false);
        }
        setSubmodels(shell.submodels ?? undefined);
    };

    const startComparison = () => {
        navigate.push(`/compare?aasId=${encodeURIComponent(aas?.id ?? '')}`);
    };

    const pageStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        alignItems: 'center',
        width: '100%',
        marginBottom: '50px',
        marginTop: '20px',
    };

    const viewerStyles = {
        maxWidth: '1125px',
        width: '90%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    };

    return (
        <Box sx={pageStyles}>
            {aas || isLoadingAas || isLoadingSubmodels ? (
                <Box sx={viewerStyles}>
                    <Box display="flex" flexDirection="row" alignContent="flex-end">
                        <Typography
                            variant="h2"
                            style={{
                                width: '90%',
                                margin: '0 auto',
                                marginTop: '10px',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                textAlign: 'center',
                                display: 'inline-block',
                            }}
                        >
                            {isLoadingAas ? (
                                <Skeleton width="40%" sx={{ margin: '0 auto' }} />
                            ) : aas?.displayName ? (
                                getTranslationText(aas?.displayName as LangStringNameType[], intl)
                            ) : (
                                ''
                            )}
                        </Typography>
                        {env.COMPARISON_FEATURE_FLAG && !isMobile && (
                            <Button variant="contained" onClick={startComparison} data-testid="detail-compare-button">
                                <FormattedMessage {...messages.mnestix.compareButton} />
                            </Button>
                        )}
                    </Box>
                    <AASOverviewCard
                        aas={aas}
                        productImage={productImage}
                        isLoading={isLoadingAas}
                        hasImage={hasImage}
                        isAccordion={isMobile}
                    />
                    <SubmodelsOverviewCard smReferences={submodels} isLoading={isLoadingSubmodels} />
                </Box>
            ) : (
                <>
                    <Typography
                        variant="h2"
                        style={{
                            width: '90%',
                            margin: '0 auto',
                            marginTop: '10px',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            textAlign: 'center',
                            display: 'inline-block',
                        }}
                    >
                        <FormattedMessage {...messages.mnestix.noDataFound} />
                    </Typography>
                    <Typography color="text.secondary">
                        <FormattedMessage
                            {...messages.mnestix.noDataFoundFor}
                            values={{ name: decodeBase64(base64AasId as string) }}
                        />
                    </Typography>
                    <Button variant="contained" startIcon={<ArrowForward />} href="/">
                        <FormattedMessage {...messages.mnestix.toHome} />
                    </Button>
                </>
            )}
        </Box>
    );
}
