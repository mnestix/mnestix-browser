import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { CoffeeConsumptionVisualizations } from './CoffeeConsumptionVisualizations';

type CoffeeConsumptionDetailProps = {
    readonly submodel: Submodel;
};

export function CoffeeConsumptionDetail(props: CoffeeConsumptionDetailProps) {
    return (
        <>
            <CoffeeConsumptionVisualizations submodel={props.submodel} />
        </>
    );
}
