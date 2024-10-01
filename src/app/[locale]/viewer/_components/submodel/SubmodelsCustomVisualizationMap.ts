import { CoffeeConsumptionDetail } from 'app/[locale]/viewer/_components/submodel/coffee-consumption/CoffeeConsumptionDetail';
import { SubmodelSemanticId } from 'lib/enums/SubmodelSemanticId.enum';
import { CarbonFootprintDetail } from 'app/[locale]/viewer/_components/submodel/carbon-footprint/CarbonFootprintDetail';
import { BillOfApplicationsDetail } from 'app/[locale]/viewer/_components/submodel/bill-of-applications/BillOfApplicationsDetail';
import { ReferenceCounterDetail } from 'app/[locale]/viewer/_components/submodel/reference-counter/ReferenceCounterDetail';
import { HierarchicalStructuresDetail } from 'app/[locale]/viewer/_components/submodel/hierarchical-structures/HierarchicalStructuresDetail';
import { TimeSeriesDetail } from 'app/[locale]/viewer/_components/submodel/time-series/TimeSeriesDetail';
export const submodelsCustomVisualizationMap = {
    [SubmodelSemanticId.CoffeeConsumptionContainer]: CoffeeConsumptionDetail,
    [SubmodelSemanticId.CarbonFootprint]: CarbonFootprintDetail,
    [SubmodelSemanticId.CarbonFootprintIRDI]: CarbonFootprintDetail,
    [SubmodelSemanticId.ReferenceCounterContainer]: ReferenceCounterDetail,
    [SubmodelSemanticId.TimeSeries]: TimeSeriesDetail,
    [SubmodelSemanticId.HierarchicalStructuresV10]: HierarchicalStructuresDetail,
    [SubmodelSemanticId.HierarchicalStructuresV11]: HierarchicalStructuresDetail,
    [SubmodelSemanticId.BillOfApplications]: BillOfApplicationsDetail
};
