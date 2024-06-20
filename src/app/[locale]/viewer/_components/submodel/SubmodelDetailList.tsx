import { Entity, ISubmodelElement, SubmodelElementCollection } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { AddressComponent } from '../submodel-elements/address-component/AddressComponent';
import { ContactInformationComponent } from '../submodel-elements/contact-information-component/ContactInformationComponent';
import { DocumentComponent } from '../submodel-elements/document-component/DocumentComponent';
import { MarkingsComponent } from '../submodel-elements/MarkingsComponent';
import { SubmodelElementRenderer } from '../submodel-elements/SubmodelElementRenderer';
import { idEquals } from 'lib/util/IdValidationUtil';

type SubmodelDetailListProps = {
    readonly submodelId: string;
    readonly submodelElements: ISubmodelElement[];
};

export function SubmodelDetailList(props: SubmodelDetailListProps) {
    // Entity element always has a line at the bottom, so we don't need an extra line on the following element
    const isEntityElementAbove = (index: number) => props.submodelElements[index - 1] instanceof Entity;
    const hasDivider = (index: number) => !(index === 0) && !isEntityElementAbove(index);

    return (
        <>
            {props.submodelElements.map((el, index) => {
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
                            submodelId={props.submodelId}
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
                            submodelId={props.submodelId}
                        />
                    );
                } else {
                    return (
                        <SubmodelElementRenderer
                            key={index}
                            submodelId={props.submodelId}
                            submodelElement={el}
                            hasDivider={hasDivider(index)}
                        />
                    );
                }
            })}
        </>
    );
}
