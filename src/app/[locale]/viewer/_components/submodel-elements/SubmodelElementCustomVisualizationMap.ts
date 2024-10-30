import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { ContactInformationComponent } from './contact-information-component/ContactInformationComponent';
import { MarkingsComponent } from './marking-components/MarkingsComponent';
import { AddressComponent } from './address-component/AddressComponent';
import { DocumentComponent } from './document-component/DocumentComponent';

export const submodelElementCustomVisualizationMap = {
    [SubmodelElementSemanticId.Address]: AddressComponent,
    [SubmodelElementSemanticId.ContactInformation]: ContactInformationComponent,
    [SubmodelElementSemanticId.Markings]: MarkingsComponent,
    [SubmodelElementSemanticId.MarkingsIrdi]: MarkingsComponent,
    [SubmodelElementSemanticId.Document]: DocumentComponent,
    [SubmodelElementSemanticId.DocumentIrdi]: DocumentComponent,
};
