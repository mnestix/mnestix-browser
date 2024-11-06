'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { decodeBase64, safeBase64Decode } from 'lib/util/Base64Util';
import { ArrowForward } from '@mui/icons-material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { LangStringNameType, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { getTranslationText } from 'lib/util/SubmodelResolverUtil';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmodelsOverviewCard } from '../_components/SubmodelsOverviewCard';
import { AASOverviewCard } from 'app/[locale]/viewer/_components/AASOverviewCard';
import { useEnv } from 'app/env/provider';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import {
    getAasFromRepository,
    performFullAasSearch,
    performSubmodelFullSearch,
} from 'lib/services/search-actions/searchActions';
import { LocalizedError } from 'lib/util/LocalizedError';
import {
    SubmodelOrIdReference, useAasOriginSourceState,
    useAasState,
    useRegistryAasState,
    useSubmodelState
} from 'components/contexts/CurrentAasContext';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { TransferButton } from 'app/[locale]/viewer/_components/transfer/TransferButton';

export default function Page() {
    const navigate = useRouter();
    const searchParams = useParams<{ base64AasId: string }>();
    const base64AasId = searchParams.base64AasId;
    const aasIdDecoded = safeBase64Decode(base64AasId);
    const [isLoadingAas, setIsLoadingAas] = useState(false);
    const notificationSpawner = useNotificationSpawner();
    const isMobile = useIsMobile();
    const intl = useIntl();
    const env = useEnv();
    const encodedRepoUrl = useSearchParams().get('repoUrl');
    const repoUrl = encodedRepoUrl ? decodeURI(encodedRepoUrl) : undefined;
    const [aasOriginUrl, setAasOriginUrl] = useAasOriginSourceState();
    const [aasFromContext, setAasFromContext] = useAasState();
    const [submodels, setSubmodels] = useSubmodelState();
    const [isSubmodelsLoading, setIsSubmodelsLoading] = useState(true);
    const [registryAasData] = useRegistryAasState();

    useAsyncEffect(async () => {
        await fetchSubmodels();
    }, [aasFromContext]);

    useEffect(() => {
        return () => {
            setSubmodels(new Array<SubmodelOrIdReference>());
        };
    }, []);

    useAsyncEffect(async () => {
        if (aasFromContext) {
            return;
        }
        setIsLoadingAas(true);
        await loadAasContent();
        setIsLoadingAas(false);
    }, [base64AasId, env]);

    async function loadAasContent() {
        if (repoUrl) {
            const response = await getAasFromRepository(aasIdDecoded, repoUrl);
            if (response.isSuccess) {
                setAasOriginUrl(repoUrl);
                setAasFromContext(response.result);
                return;
            }
        }

        const { isSuccess, result } = await performFullAasSearch(aasIdDecoded);
        if (!isSuccess) {
            showError(new LocalizedError(messages.mnestix.aasUrlNotFound), notificationSpawner);
        } else if (result.aas) {
            setAasOriginUrl(result.aasData?.aasRepositoryOrigin ?? null);
            setAasFromContext(result.aas);
        } else {
            navigate.push(result.redirectUrl);
        }
    }

    async function fetchSubmodels() {
        setIsSubmodelsLoading(true);
        if (aasFromContext?.submodels) {
            await Promise.all(
                aasFromContext.submodels.map(async (smRef, i) => {
                    const newSm = await fetchSingleSubmodel(smRef, registryAasData?.submodelDescriptors?.[i]);
                    setSubmodels((submodels) => {
                        const exists = submodels.some((sm) => sm.id === newSm.id);
                        if (exists) return submodels;
                        return [...submodels, newSm];
                    });
                }),
            );
        }
        setIsSubmodelsLoading(false);
    }

    async function fetchSingleSubmodel(
        reference: Reference,
        smDescriptor?: SubmodelDescriptor,
    ): Promise<SubmodelOrIdReference> {
        const submodelResponse = await performSubmodelFullSearch(reference, smDescriptor);
        if (!submodelResponse.isSuccess)
            return {
                id: reference.keys[0].value,
                error: 'Submodel failed to load', // TODO error localization
            };

        return {
            id: submodelResponse.result.id,
            submodel: submodelResponse.result,
        };
    }

    const startComparison = () => {
        navigate.push(`/compare?aasId=${encodeURIComponent(aasIdDecoded)}`);
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
            {aasFromContext || isLoadingAas ? (
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
                            ) : aasFromContext?.displayName ? (
                                getTranslationText(aasFromContext?.displayName as LangStringNameType[], intl)
                            ) : (
                                ''
                            )}
                        </Typography>
                        {env.COMPARISON_FEATURE_FLAG && !isMobile && (
                            <Button
                                sx={{ mr: 2 }}
                                variant="contained"
                                onClick={startComparison}
                                data-testid="detail-compare-button"
                            >
                                <FormattedMessage {...messages.mnestix.compareButton} />
                            </Button>
                        )}
                        <TransferButton />
                    </Box>
                    <AASOverviewCard
                        aas={aasFromContext ?? null}
                        productImage={aasFromContext?.assetInformation?.defaultThumbnail?.path}
                        isLoading={isLoadingAas}
                        isAccordion={isMobile}
                        repositoryURL={aasOriginUrl}
                    />
                    {aasFromContext?.submodels && aasFromContext.submodels.length > 0 && (
                        <SubmodelsOverviewCard submodelIds={submodels} submodelsLoading={isSubmodelsLoading} />
                    )}
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
                            values={{ name: decodeBase64(base64AasId) }}
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
