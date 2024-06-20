import { Submodel, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { InfluxTimeSeries } from './InfluxTimeSeries';

export function TimeSeriesVisualizations(props: { submodel: Submodel }) {
    const timeSeriesSegments = props.submodel.submodelElements?.find(
        (el) => el.semanticId?.keys[0].value === SubmodelElementSemanticId.TimeSeriesSegments,
    ) as SubmodelElementCollection | undefined;

    const linkedSegments = timeSeriesSegments?.value?.filter(
        (el) => el.semanticId?.keys[0].value === SubmodelElementSemanticId.LinkedSegment,
    ) as Array<SubmodelElementCollection> | undefined;

    return linkedSegments && linkedSegments.length ? (
        <>
            {linkedSegments.map((segment, index) => {
                return <InfluxTimeSeries submodelElement={segment} key={index} />;
            })}
        </>
    ) : (
        <></>
    );
}
