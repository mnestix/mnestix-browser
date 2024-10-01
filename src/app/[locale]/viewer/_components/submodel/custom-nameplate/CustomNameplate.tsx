import { Property } from '@aas-core-works/aas-core3.0-typescript/types';
import { SubmodelDetailComponentProps } from 'app/[locale]/viewer/_components/submodel/SubmodelDetailComponentProps';

export default function CustomNameplate({submodel}: SubmodelDetailComponentProps){

    return (
        <>
            <h1>Ich bin der Custom Test Submodel hallo </h1>
            <p>    {submodel.idShort}</p>
            <p>    {submodel.id}</p>
            <p>    {(submodel.submodelElements![0] as Property).value}</p>
        </>
    )
}