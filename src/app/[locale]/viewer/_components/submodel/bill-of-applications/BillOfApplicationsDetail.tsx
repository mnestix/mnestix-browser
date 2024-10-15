import { Entity, ISubmodelElement, KeyTypes, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { ApplicationComponent } from './visualization-components/ApplicationComponent';
import { getKeyType } from 'lib/util/KeyTypeUtil';

type BillOfApplicationsDetailProps = {
    readonly submodel: Submodel;
};

export function BillOfApplicationsDetail(props: BillOfApplicationsDetailProps) {
    const submodelElements = props.submodel.submodelElements as ISubmodelElement[];
    const entryNode = submodelElements.find((el) => getKeyType(el) === KeyTypes.Entity) as Entity;

    return <ApplicationComponent entity={entryNode as Entity} />;
}
