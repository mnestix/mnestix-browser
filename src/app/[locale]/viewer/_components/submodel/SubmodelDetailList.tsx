import { Entity, Submodel, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelElementRenderer } from '../submodel-elements/SubmodelElementRenderer';
import { idEquals } from 'lib/util/IdValidationUtil';
import { submodelElementVisualizationsMap } from 'app/[locale]/viewer/_components/submodel-elements/SubmodelElementMapping';
import { Fragment } from 'react';

type SubmodelDetailListProps = {
    readonly submodel: Submodel;
};

export function SubmodelDetailList(props: SubmodelDetailListProps) {
    const submodelElements = props.submodel.submodelElements ?? [];

    // Entity element always has a line at the bottom, so we don't need an extra line on the following element
    const isEntityElementAbove = (index: number) => submodelElements[index - 1] instanceof Entity;
    const hasDivider = (index: number) => !(index === 0) && !isEntityElementAbove(index);

    return (
        <>
            {submodelElements.map((el, index) => {
                const semanticId = el.semanticId?.keys?.[0]?.value;

                // We have to use the idEquals function here to correctly handle IRDIs
                const visualizationMapKey =
                    (Object.keys(submodelElementVisualizationsMap) as Array<string>).find((key) =>
                        idEquals(semanticId, key),
                    ) ?? '';
                const SelectedComponent = submodelElementVisualizationsMap[visualizationMapKey];

                return (
                    <Fragment key={index}>
                        {SelectedComponent ? (
                            <SelectedComponent
                                key={index}
                                submodelElement={el as SubmodelElementCollection}
                                submodelId={props.submodel.id}
                                hasDivider={hasDivider(index)}
                            />
                        ) : (
                            <SubmodelElementRenderer
                                key={index}
                                submodelElement={el}
                                submodelId={props.submodel.id}
                                hasDivider={hasDivider(index)}
                            />
                        )}
                    </Fragment>
                );
            })}
        </>
    );
}
