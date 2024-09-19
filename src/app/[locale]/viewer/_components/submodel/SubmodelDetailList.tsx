import { Entity, Submodel, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { AddressComponent } from '../submodel-elements/address-component/AddressComponent';
import { ContactInformationComponent } from '../submodel-elements/contact-information-component/ContactInformationComponent';
import { DocumentComponent } from '../submodel-elements/document-component/DocumentComponent';
import { MarkingsComponent } from '../submodel-elements/MarkingsComponent';
import { SubmodelElementRenderer } from '../submodel-elements/SubmodelElementRenderer';
import { idEquals } from 'lib/util/IdValidationUtil';

type SubmodelDetailListProps = {
    readonly submodel: Submodel;
};

export function SubmodelDetailList(props: SubmodelDetailListProps) {
    const submodelElements = props.submodel.submodelElements ?? [];
    const submodelId = props.submodel.id;
    // Entity element always has a line at the bottom, so we don't need an extra line on the following element
    const isEntityElementAbove = (index: number) => submodelElements[index - 1] instanceof Entity;
    const hasDivider = (index: number) => !(index === 0) && !isEntityElementAbove(index);

    return (
        <>
            {submodelElements.map((el, index) => {
                const id = el.semanticId?.keys?.[0]?.value;

                if (idEquals(id, SubmodelElementSemanticId.Address)) {
                    return (
                        <AddressComponent
                            key={index}
                            submodelElement={el as SubmodelElementCollection}
                            hasDivider={hasDivider(index)}
                        />
                    );
                } else if (idEquals(id, SubmodelElementSemanticId.ContactInformation)) {
                    return (
                        <ContactInformationComponent
                            key={index}
                            submodelElement={el as SubmodelElementCollection}
                            hasDivider={hasDivider(index)}
                        />
                    );
                } else if (
                    idEquals(id, SubmodelElementSemanticId.MarkingsIrdi) ||
                    idEquals(id, SubmodelElementSemanticId.Markings)
                ) {
                    return (
                        <MarkingsComponent
                            key={index}
                            submodelElement={el as SubmodelElementCollection}
                            hasDivider={hasDivider(index)}
                            submodelId={submodelId}
                        />
                    );
                } else if (
                    idEquals(id, SubmodelElementSemanticId.DocumentIrdi) ||
                    idEquals(id, SubmodelElementSemanticId.Document)
                ) {
                    return (
                        <DocumentComponent
                            key={index}
                            submodelElement={el as SubmodelElementCollection}
                            hasDivider={hasDivider(index)}
                            submodelId={submodelId}
                        />
                    );
                } else {
                    return (
                        <SubmodelElementRenderer
                            key={index}
                            submodelId={submodelId}
                            submodelElement={el}
                            hasDivider={hasDivider(index)}
                        />
                    );
                }
            })}
        </>
    );
}
