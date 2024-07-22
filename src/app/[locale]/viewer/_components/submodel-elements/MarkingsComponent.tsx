import { Box } from '@mui/material';
import { File, Property, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { DataRow } from 'components/basics/DataRow';
import { SingleMarkingsComponent } from './SingleMarkingsComponent';

type MarkingsComponentProps = {
    readonly submodelElement?: SubmodelElementCollection;
    readonly hasDivider?: boolean;
    readonly submodelId?: string;
};

export function MarkingsComponent(props: MarkingsComponentProps) {
    const markings: Array<SubmodelElementCollection> = Object.values(
        props.submodelElement?.value || {},
    ) as Array<SubmodelElementCollection>;

    // Iterate through all markings
    const markingImages = markings.map((el, index) => {
        let file: File | undefined;
        let name: Property | undefined;
        let additionalText: Property | undefined;

        let idShortPath = '';
        if (props.submodelElement?.idShort) {
            idShortPath = props.submodelElement?.idShort + '.' + el.idShort;
        }

        // Iterate through single marking properties
        Object.values(el.value || {}).forEach((markingPart) => {
            switch (markingPart.idShort) {
                case 'MarkingFile':
                    file = markingPart as File;
                    break;
                case 'MarkingName':
                    name = markingPart as Property;
                    break;
                case 'MarkingAdditionalText':
                    additionalText = markingPart as Property;
                    break;
            }
        });
        // Build single marking
        return (
            !!file && file.contentType && 
            file.contentType.startsWith('image') && (
                <SingleMarkingsComponent
                    key={index}
                    file={file}
                    name={name}
                    additionalText={additionalText}
                    submodelId={props.submodelId}
                    idShortPath={idShortPath}
                />
            )
        );
    });
    // render all
    return (
        <DataRow title={props.submodelElement?.idShort} hasDivider={props.hasDivider}>
            <Box display="flex" gap="20px" flexWrap="wrap" sx={{ my: 1 }}>
                {markingImages}
            </Box>
        </DataRow>
    );
}
