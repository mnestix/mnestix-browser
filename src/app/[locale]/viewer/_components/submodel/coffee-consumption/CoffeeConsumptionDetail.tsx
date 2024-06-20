import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { CoffeeConsumptionVisualizations } from './CoffeeConsumptionVisualizations';

type ReferenceCounterDetailProps = {
    readonly submodel: Submodel;
};

export function CoffeeConsumptionDetail(props: ReferenceCounterDetailProps) {
    return (
        <>
            <CoffeeConsumptionVisualizations submodel={props.submodel} />
        </>
    );
}
