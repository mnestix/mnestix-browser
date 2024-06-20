import { KeyTypes, Class } from '@aas-core-works/aas-core3.0-typescript/types';

export function GetKeyType(el: Class) {
    try {
        const jsonable = JSON.parse(JSON.stringify(el));

        switch (jsonable.modelType) {
            case 'AssetAdministrationShell':
                return KeyTypes.AssetAdministrationShell;
            case 'Submodel':
                return KeyTypes.Submodel;
            case 'ConceptDescription':
                return KeyTypes.ConceptDescription;
            case 'SubmodelElementCollection':
                return KeyTypes.SubmodelElementCollection;
            case 'SubmodelElementList':
                return KeyTypes.SubmodelElementList;
            case 'BasicEventElement':
                return KeyTypes.BasicEventElement;
            case 'Blob':
                return KeyTypes.Blob;
            case 'Entity':
                return KeyTypes.Entity;
            case 'File':
                return KeyTypes.File;
            case 'MultiLanguageProperty':
                return KeyTypes.MultiLanguageProperty;
            case 'Property':
                return KeyTypes.Property;
            case 'Operation':
                return KeyTypes.Operation;
            case 'Range':
                return KeyTypes.Range;
            case 'ReferenceElement':
                return KeyTypes.ReferenceElement;
            case 'RelationshipElement':
                return KeyTypes.RelationshipElement;
            case 'AnnotatedRelationshipElement':
                return KeyTypes.AnnotatedRelationshipElement;
            case 'Identifiable':
                return KeyTypes.Identifiable;
            case 'Referable':
                return KeyTypes.Referable;
            case 'GlobalReference':
                return KeyTypes.GlobalReference;
            default:
                return KeyTypes.SubmodelElement;
        }
    } catch (error: unknown) {
        return NaN;
    }
}
