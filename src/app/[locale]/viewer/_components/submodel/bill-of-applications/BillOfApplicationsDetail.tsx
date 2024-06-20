import { Entity, ISubmodelElement, KeyTypes, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApplicationComponent } from './visualization-components/ApplicationComponent';
import { GetKeyType } from 'lib/util/KeyTypeUtil';

type BillOfApplicationsDetailProps = {
    readonly submodel: Submodel;
};

export function BillOfApplicationsDetail(props: BillOfApplicationsDetailProps) {
    const submodelElements = props.submodel.submodelElements as ISubmodelElement[];
    const entryNode = submodelElements.find((el) => GetKeyType(el) === KeyTypes.Entity) as Entity;

    return <ApplicationComponent entity={entryNode as Entity} />;
}
