import { Box } from '@mui/material';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelDetailList } from './SubmodelDetailList';
import { SubmodelSemanticId } from 'lib/enums/SubmodelSemanticId.enum';
import { HierarchicalStructuresDetail } from './hierarchical-structures/HierarchicalStructuresDetail';
import { CarbonFootprintDetail } from './carbon-footprint/CarbonFootprintDetail';
import { TimeSeriesDetail } from './time-series/TimeSeriesDetail';
import { CoffeeConsumptionDetail } from './coffee-consumption/CoffeeConsumptionDetail';
import { ReferenceCounterDetail } from './reference-counter/ReferenceCounterDetail';
import { BillOfApplicationsDetail } from './bill-of-applications/BillOfApplicationsDetail';
import { irdiPathEquals } from 'lib/util/IdValidationUtil';

type SubmodelDetailProps = {
    submodel?: Submodel;
};

export function SubmodelDetail(props: SubmodelDetailProps) {
    const submodelElements = props.submodel?.submodelElements;
    if (!props.submodel || !submodelElements) return <></>;

    const semanticId = props.submodel.semanticId?.keys?.[0]?.value;

    if (semanticId === SubmodelSemanticId.CoffeeConsumptionContainer) {
        return (
            <Box width="100%">
                <CoffeeConsumptionDetail submodel={props.submodel} />
            </Box>
        );
    } else if (semanticId === SubmodelSemanticId.ReferenceCounterContainer) {
        return (
            <Box width="100%">
                <ReferenceCounterDetail submodel={props.submodel} />
            </Box>
        );
    } else if (
        semanticId === SubmodelSemanticId.CarbonFootprint ||
        (semanticId && irdiPathEquals(SubmodelSemanticId.CarbonFootprintIRDI, semanticId))
    ) {
        return (
            <Box width="100%">
                <CarbonFootprintDetail submodel={props.submodel} />
            </Box>
        );
    } else if (semanticId === SubmodelSemanticId.TimeSeries) {
        return (
            <Box width="100%">
                <TimeSeriesDetail submodel={props.submodel} />
            </Box>
        );
    } else if (
        semanticId === SubmodelSemanticId.HierarchicalStructuresV10 ||
        semanticId === SubmodelSemanticId.HierarchicalStructuresV11
    ) {
        return (
            <Box width="100%">
                <HierarchicalStructuresDetail submodel={props.submodel} />
            </Box>
        );
    } else if (semanticId === SubmodelSemanticId.BillOfApplications) {
        return (
            <Box width="100%">
                <BillOfApplicationsDetail submodel={props.submodel} />
            </Box>
        );
    } else {
        return (
            <Box width="100%">
                <SubmodelDetailList submodelId={props.submodel.id} submodelElements={submodelElements} />
            </Box>
        );
    }
}
