import { ExpandableDefaultSubmodelDisplay } from 'components/basics/ExpandableNestedContentWrapper';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { CarbonFootprintVisualizations } from './CarbonFootprintVisualizations';

type CarbonFootprintDetailProps = {
    readonly submodel: Submodel;
};

export function CarbonFootprintDetail(props: CarbonFootprintDetailProps) {
    return (
        <>
            <CarbonFootprintVisualizations submodel={props.submodel} />
            <ExpandableDefaultSubmodelDisplay submodel={props.submodel} />
        </>
    );
}
