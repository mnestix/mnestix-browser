import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { submodelVisualizationsMap } from 'app/[locale]/viewer/_components/submodel/SubmodelMapping';
import { SubmodelDetailList } from 'app/[locale]/viewer/_components/submodel/SubmodelDetailList';
import { Box } from '@mui/material';
import { idEquals } from 'lib/util/IdValidationUtil';

type SubmodelDetailProps = {
    submodel?: Submodel;
};

export function SubmodelDetail(props: SubmodelDetailProps) {
    const submodelElements = props.submodel?.submodelElements;
    if (!props.submodel || !submodelElements) return <></>;

    const semanticId = props.submodel.semanticId?.keys?.[0]?.value;

    const key =
        (Object.keys(submodelVisualizationsMap) as Array<string>).find((key) => idEquals(semanticId, key)) ?? '';

    const SelectedComponent = submodelVisualizationsMap[key];

    return (
        <Box width="100%">
            {SelectedComponent ? (
                <SelectedComponent submodel={props.submodel} />
            ) : (
                <SubmodelDetailList submodel={props.submodel} />
            )}
        </Box>
    );
}
