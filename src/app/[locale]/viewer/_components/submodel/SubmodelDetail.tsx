import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { submodelCustomVisualizationMap } from './SubmodelCustomVisualizationMap';
import { GenericSubmodelDetailComponent } from './generic-submodel/GenericSubmodelDetailComponent';
import { Box } from '@mui/material';
import { idEquals } from 'lib/util/IdValidationUtil';
import { useState } from 'react';

type SubmodelDetailProps = {
    submodel?: Submodel;
};

export function SubmodelDetail(props: SubmodelDetailProps) {
    const [state, setState] = useState(() => {
        console.log(`SubmodelDetail init ${props.submodel?.idShort}`);
        return true;
    });

    const submodelElements = props.submodel?.submodelElements;
    if (!props.submodel || !submodelElements) return <></>;

    const semanticId = props.submodel.semanticId?.keys?.[0]?.value;

    // We have to use the idEquals function here to correctly handle IRDIs
    const key =
        (Object.keys(submodelCustomVisualizationMap) as Array<string>).find((key) => idEquals(semanticId, key)) ?? '';

    const CustomSubmodelComponent = submodelCustomVisualizationMap[key];

    return (
        <Box width="100%">
            {CustomSubmodelComponent ? (
                <CustomSubmodelComponent submodel={props.submodel} />
            ) : (
                <GenericSubmodelDetailComponent submodel={props.submodel} />
            )}
        </Box>
    );
}
