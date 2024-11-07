import { SubmodelSemanticId } from 'lib/enums/SubmodelSemanticId.enum';
import { CarbonFootprintDetail } from './carbon-footprint/CarbonFootprintDetail';
import { BillOfApplicationsDetail } from './bill-of-applications/BillOfApplicationsDetail';
import { ReferenceCounterDetail } from './reference-counter/ReferenceCounterDetail';
import { HierarchicalStructuresDetail } from './hierarchical-structures/HierarchicalStructuresDetail';
import { TimeSeriesDetail } from './time-series/TimeSeriesDetail';

export const submodelCustomVisualizationMap = {
    [SubmodelSemanticId.CarbonFootprint]: CarbonFootprintDetail,
    [SubmodelSemanticId.CarbonFootprintIrdi]: CarbonFootprintDetail,
    [SubmodelSemanticId.ReferenceCounterContainer]: ReferenceCounterDetail,
    [SubmodelSemanticId.TimeSeries]: TimeSeriesDetail,
    [SubmodelSemanticId.HierarchicalStructuresV10]: HierarchicalStructuresDetail,
    [SubmodelSemanticId.HierarchicalStructuresV11]: HierarchicalStructuresDetail,
    [SubmodelSemanticId.BillOfApplications]: BillOfApplicationsDetail,
};
