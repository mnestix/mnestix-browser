import { ExpandableDefaultSubmodelDisplay } from 'components/basics/ExpandableNestedContentWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { TimeSeriesVisualizations } from './TimeSeriesVisualizations';

type TimeSeriesDetailProps = {
    readonly submodel: Submodel;
};

export function TimeSeriesDetail(props: TimeSeriesDetailProps) {
    return (
        <>
            <TimeSeriesVisualizations submodel={props.submodel} />
            <ExpandableDefaultSubmodelDisplay submodel={props.submodel} />
        </>
    );
}
