import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { ContactInformationComponent } from 'app/[locale]/viewer/_components/submodel-elements/contact-information-component/ContactInformationComponent';
import { MarkingsComponent } from 'app/[locale]/viewer/_components/submodel-elements/marking-components/MarkingsComponent';
import { AddressComponent } from 'app/[locale]/viewer/_components/submodel-elements/address-component/AddressComponent';
import { DocumentComponent } from 'app/[locale]/viewer/_components/submodel-elements/document-component/DocumentComponent';

export const submodelElementCustomVisualizationMap = {
    [SubmodelElementSemanticId.Address]: AddressComponent,
    [SubmodelElementSemanticId.ContactInformation]: ContactInformationComponent,
    [SubmodelElementSemanticId.Markings]: MarkingsComponent,
    [SubmodelElementSemanticId.MarkingsIrdi]: MarkingsComponent,
    [SubmodelElementSemanticId.Document]: DocumentComponent,
    [SubmodelElementSemanticId.DocumentIrdi]: DocumentComponent
};
