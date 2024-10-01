import { Property } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import {
    SubmodelElementVisualizationProps
} from 'app/[locale]/viewer/_components/submodel-elements/SubmodelElementVisualizationProps';


export default function SerialNumberComponent({submodelElement, submodelId }: SubmodelElementVisualizationProps) {

    return (
        <>
            {' '}
            <h1>Serial Number:</h1>
            <p>Submodel Id: {submodelId}</p>
            <p>Submodel Value: {(submodelElement as Property).value!}</p>
        </>
    );
}