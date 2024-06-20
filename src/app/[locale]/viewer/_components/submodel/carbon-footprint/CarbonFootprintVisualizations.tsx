import { Box } from '@mui/material';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import { Address, AddressPerLifeCyclePhase, ProductJourney } from './visualization-components/ProductJourney';
import { CalculationMethod } from './visualization-components/CalculationMethod';
import { CO2Equivalents } from './visualization-components/CO2Equivalents';
import { CO2EquivalentsDistribution } from './visualization-components/CO2EquivalentsDistribution';
import { Comparison } from './visualization-components/Comparison';
import { ProductLifecycle } from './visualization-components/ProductLifecycle';
import { hasSemanticId } from 'lib/util/SubmodelResolverUtil';
import { ProductLifecycleStage } from 'lib/enums/ProductLifecycleStage.enum';
import { StyledDataRow } from 'components/basics/StyledDataRow';
import {
    Property,
    Submodel,
    SubmodelElementCollection,
    ISubmodelElement,
} from '@aas-core-works/aas-core3.0-typescript/types';

export function CarbonFootprintVisualizations(props: { submodel: Submodel }) {
    const intl = useIntl();

    const pcfSubmodelElements = props.submodel.submodelElements?.filter((el) =>
        hasSemanticId(el, SubmodelElementSemanticId.ProductCarbonFootprint),
    ) as Array<SubmodelElementCollection> | undefined;

    if (pcfSubmodelElements === undefined || !pcfSubmodelElements.length) return <></>;

    pcfSubmodelElements.sort((a, b) => {
        const firstPCFLiveCyclePhase = (
            a.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFLiveCyclePhase)) as Property
        )?.value;
        const secondPCFLiveCyclePhase = (
            b.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFLiveCyclePhase)) as Property
        )?.value;
        if (firstPCFLiveCyclePhase === null || secondPCFLiveCyclePhase === null) {
            return 0;
        }
        return firstPCFLiveCyclePhase > secondPCFLiveCyclePhase ? 1 : -1;
    });

    const totalCO2Equivalents = extractTotalCO2Equivalents(pcfSubmodelElements);
    const co2EquivalentsPerLifecycleStage = ExtractCO2EquivalentsPerLifeCycleStage(pcfSubmodelElements);
    const completedStages = extractCompletedStages(pcfSubmodelElements);
    const addressesPerLifeCyclePhase: AddressPerLifeCyclePhase[] = pcfSubmodelElements.map(
        extractAddressPerLifeCyclePhaseFromPCFSubmodel,
    );
    const calculationMethod = extractCalculationMethod(pcfSubmodelElements);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.totalCO2Equivalents)}>
                <CO2Equivalents totalCO2Equivalents={totalCO2Equivalents} />
            </StyledDataRow>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.completedStages)}>
                <ProductLifecycle completedStages={completedStages} />
            </StyledDataRow>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.co2EDistribution)}>
                <CO2EquivalentsDistribution
                    co2EquivalentsPerLifecycleStage={co2EquivalentsPerLifecycleStage}
                    totalCO2Equivalents={totalCO2Equivalents}
                />
            </StyledDataRow>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.co2EComparison)}>
                <Comparison co2Equivalents={totalCO2Equivalents} />
            </StyledDataRow>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.productJourney)}>
                <ProductJourney addressesPerLifeCyclePhase={addressesPerLifeCyclePhase} />
            </StyledDataRow>
            <StyledDataRow title={intl.formatMessage(messages.mnestix.productCarbonFootprint.calculationMethod)}>
                <CalculationMethod calculationMethod={calculationMethod} />
            </StyledDataRow>
        </Box>
    );
}

function extractCalculationMethod(pcfSubmodelElements: SubmodelElementCollection[]): string {
    return (
        pcfSubmodelElements
            .map(
                (el) =>
                    (
                        el.value?.find((v) =>
                            hasSemanticId(v, SubmodelElementSemanticId.PCFCalculationMethod),
                        ) as Property
                    )?.value,
            )
            .at(0) ?? ''
    );
}

function extractCompletedStages(pcfSubmodelElements: SubmodelElementCollection[]): Array<ProductLifecycleStage> {
    return pcfSubmodelElements.map(
        (el) =>
            ((el.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFLiveCyclePhase)) as Property)?.value
                ?.substring(0, 2)
                .trim() as ProductLifecycleStage) ?? [],
    );
}

function ExtractCO2EquivalentsPerLifeCycleStage(
    pcfSubmodelElements: SubmodelElementCollection[],
): Partial<Record<ProductLifecycleStage, number>> {
    return pcfSubmodelElements.reduce(
        (o, key) => ({
            ...o,
            [(key.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFLiveCyclePhase)) as Property)?.value
                ?.substring(0, 2)
                .trim() ?? ProductLifecycleStage.A3Production]: Number.parseFloat(
                (key.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFCO2eq)) as Property)?.value ?? '',
            ),
        }),
        {},
    );
}

function extractTotalCO2Equivalents(pcfSubmodelElements: SubmodelElementCollection[]): number {
    return pcfSubmodelElements.reduce(
        (prev, curr) =>
            prev +
                Number.parseFloat(
                    (curr.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFCO2eq)) as Property)
                        ?.value ?? '',
                ) ?? 0,
        0,
    );
}

function extractAddressPerLifeCyclePhaseFromPCFSubmodel(el: SubmodelElementCollection): AddressPerLifeCyclePhase {
    const lifeCyclePhase = (
        el.value?.find((v) => hasSemanticId(v, SubmodelElementSemanticId.PCFLiveCyclePhase)) as Property
    )?.value
        ?.substring(0, 2)
        .trim() as ProductLifecycleStage;

    const PCFGoodsAddressHandover = (
        el.value?.find((v) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFGoodsAddressHandover),
        ) as SubmodelElementCollection
    )?.value;

    const Latitude = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressLatitude),
        ) as Property
    )?.value;

    const Longitude = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressLongitude),
        ) as Property
    )?.value;

    const Street = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressStreet),
        ) as Property
    )?.value;

    const HouseNumber = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressHouseNumber),
        ) as Property
    )?.value;

    const ZipCode = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressZipCode),
        ) as Property
    )?.value;

    const CityTown = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressCityTown),
        ) as Property
    )?.value;

    const Country = (
        PCFGoodsAddressHandover?.find((v: ISubmodelElement) =>
            hasSemanticId(v, SubmodelElementSemanticId.PCFAddressCountry),
        ) as Property
    )?.value;

    const address: Address = {
        Latitude: Latitude ? Number.parseFloat(Latitude) : undefined,
        Longitude: Longitude ? Number.parseFloat(Longitude) : undefined,
        Street: Street ?? undefined,
        HouseNumber: HouseNumber ?? undefined,
        ZipCode: ZipCode ?? undefined,
        CityTown: CityTown ?? undefined,
        Country: Country ?? undefined,
    };

    return {
        lifeCyclePhase: lifeCyclePhase,
        address,
    };
}
