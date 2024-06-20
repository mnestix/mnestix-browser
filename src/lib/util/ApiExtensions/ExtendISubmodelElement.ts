import { ISubmodelElement, LangStringTextType } from '@aas-core-works/aas-core3.0-typescript/types';

export interface SubModelElementCollectionContactInfo extends ISubmodelElement {
    value: string | Array<LangStringTextType> | null;
}
