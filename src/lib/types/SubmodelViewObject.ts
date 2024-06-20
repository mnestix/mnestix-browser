import { Submodel, ISubmodelElement } from '@aas-core-works/aas-core3.0-typescript/types';

export interface SubmodelViewObject {
    id: string;
    name: string;
    data?: Submodel | ISubmodelElement;
    children: SubmodelViewObject[];
    hasValue?: boolean;
    isAboutToBeDeleted?: boolean;
    propertyValue?: string;
}
