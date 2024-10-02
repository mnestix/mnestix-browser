import { Typography } from '@mui/material';
import { PropertyComponent } from './PropertyComponent';
import { SubmodelElementCollectionComponent } from './SubmodelElementCollectionComponent';
import { DataRow } from 'components/basics/DataRow';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { FileComponent } from './FileComponent';
import { MultiLanguagePropertyComponent } from './MultiLanguagePropertyComponent';
import {
    Entity,
    File,
    KeyTypes,
    MultiLanguageProperty,
    Property,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/types';
import { EntityComponent } from './entity-components/EntityComponent';
import { getKeyType } from 'lib/util/KeyTypeUtil';
import { buildSubmodelElementPath } from 'lib/util/SubmodelResolverUtil';
import {
    SubmodelElementComponentProps
} from '../SubmodelElementComponentProps';

type SubmodelElementRendererProps = SubmodelElementComponentProps & {
    readonly submodelElementPath?: string | null;
    readonly wrapInDataRow?: boolean;
};

export function GenericSubmodelElementComponent(props: SubmodelElementRendererProps) {
    function getRenderElement() {
        if (!props.submodelElement) {
            return;
        }
        /**
         * We trust that modelType gives us enough information
         * to map the submodelElement interface from our api client to specific types
         */
        const submodelElementType = getKeyType(props.submodelElement);

        switch (submodelElementType) {
            case KeyTypes.Property:
                return <PropertyComponent property={props.submodelElement as Property} />;
            case KeyTypes.SubmodelElementCollection:
                return (
                    <SubmodelElementCollectionComponent
                        submodelElementCollection={props.submodelElement as SubmodelElementCollection}
                        submodelId={props.submodelId}
                        submodelElementPath={buildSubmodelElementPath(
                            props.submodelElementPath,
                            props.submodelElement.idShort,
                        )}
                    />
                );
            case KeyTypes.File:
                return (
                    <FileComponent
                        file={props.submodelElement as File}
                        submodelId={props.submodelId}
                        submodelElementPath={buildSubmodelElementPath(
                            props.submodelElementPath,
                            props.submodelElement.idShort,
                        )}
                    />
                );
            case KeyTypes.MultiLanguageProperty:
                return <MultiLanguagePropertyComponent mLangProp={props.submodelElement as MultiLanguageProperty} />;
            case KeyTypes.Entity:
                return <EntityComponent entity={props.submodelElement as Entity} />;
            default:
                return (
                    <Typography color="error" variant="body2">
                        <FormattedMessage
                            {...messages.mnestix.unknownModelType}
                            values={{ type: `${submodelElementType}` }}
                        />
                    </Typography>
                );
        }
    }

    return props.wrapInDataRow !== false ? (
        <DataRow title={props.submodelElement?.idShort} hasDivider={props.hasDivider}>
            {getRenderElement()}
        </DataRow>
    ) : (
        <>{getRenderElement()}</>
    );
}
