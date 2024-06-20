import { ISubmodelElement } from '@aas-core-works/aas-core3.0-typescript/types';

export class SubmodelCompareData {
    semanticId: string | null;
    idShort: string | null;
    dataRecords: (SubmodelCompareDataRecord | SubmodelCompareData)[] | null;
}

export class SubmodelCompareDataRecord {
    semanticId: string | null;
    idShort: string | null;
    submodelElements: (ISubmodelElement | null)[];
}
