import { Submodel, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { InfluxTimeSeries } from './InfluxTimeSeries';
import { InternalTimeSeries } from 'app/[locale]/viewer/_components/submodel/time-series/InternalTimeSeries';
import { hasSemanticId } from 'lib/util/SubmodelResolverUtil';
import { messages } from 'lib/i18n/localization';
import { FormattedMessage } from 'react-intl';

export function TimeSeriesVisualizations(props: { submodel: Submodel }) {
    const timeSeriesSegments = props.submodel.submodelElements?.find(
        (el) => el.semanticId?.keys[0].value === SubmodelElementSemanticId.TimeSeriesSegments,
    ) as SubmodelElementCollection | undefined;

    const linkedSegments = timeSeriesSegments?.value?.filter((el) =>
        hasSemanticId(el, SubmodelElementSemanticId.TimeSeriesLinkedSegment),
    ) as Array<SubmodelElementCollection> | undefined;

    const internalSegments = timeSeriesSegments?.value?.filter((el) =>
        hasSemanticId(el, SubmodelElementSemanticId.TimeSeriesInternalSegment),
    ) as Array<SubmodelElementCollection> | undefined;

    return (
        <>
            {linkedSegments && linkedSegments.length > 0 && (
                <>
                    <FormattedMessage {...messages.mnestix.timeSeries.linkedSegments} />
                    <br />
                    {linkedSegments.map((segment, index) => {
                        return <InfluxTimeSeries submodelElement={segment} key={index} />;
                    })}
                </>
            )}

            {internalSegments && internalSegments.length > 0 && (
                <>
                    <FormattedMessage {...messages.mnestix.timeSeries.internalSegments} />
                    <br />
                    {internalSegments?.map((segment, index) => {
                        return <InternalTimeSeries submodelElement={segment} key={index} />;
                    })}
                </>
            )}
        </>
    );
}
