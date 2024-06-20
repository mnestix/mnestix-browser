import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { ReferenceCounterVisualizations } from './ReferenceCounterVisualizations';

type ReferenceCounterDetailProps = {
    readonly submodel: Submodel;
};

export function ReferenceCounterDetail(props: ReferenceCounterDetailProps) {
    return (
        <>
            <ReferenceCounterVisualizations submodel={props.submodel} />
        </>
    );
}
