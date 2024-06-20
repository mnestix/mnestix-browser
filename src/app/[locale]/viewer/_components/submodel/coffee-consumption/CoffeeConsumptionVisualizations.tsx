/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { messages } from 'lib/i18n/localization';
import { useIntl } from 'react-intl';
import { ArrowForward } from '@mui/icons-material';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useEffect, useState } from 'react';
import CowMilk from 'assets/CoffeeConsumptionIcons/grey/grey_cow.svg';
import OatMilk from 'assets/CoffeeConsumptionIcons/grey/grey_oat.svg';
import Sugar from 'assets/CoffeeConsumptionIcons/grey/grey_sugar.svg';
import None from 'assets/CoffeeConsumptionIcons/grey/grey_none.svg';

import Cappuccino from 'assets/CoffeeConsumptionIcons/grey/grey_cappuccino.svg';
import Coffee from 'assets/CoffeeConsumptionIcons/grey/grey_coffee.svg';
import Chai from 'assets/CoffeeConsumptionIcons/grey/grey_chai.svg';
import Espresso from 'assets/CoffeeConsumptionIcons/grey/grey_espresso.svg';
import EspressoDouble from 'assets/CoffeeConsumptionIcons/grey/grey_espresso_double.svg';

import TakeHomeMessage from 'assets/automaticaTakeHomeMessage.svg';
import { useApis } from 'components/azureAuthentication/ApiProvider';
import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';

type Element = {
    address: string;
    coffeeName: string;
    coffeeIcon: string;
    count: number;
    elementName: string;
    milk: { ingredientName: string; quantity: string };
    milkIcon: string;
    sugar: { ingredientName: string; quantity: string };
    sugarIcon: string;
};

type SubmodelElementWithValue = {
    value: {
        value: string;
        idShort: string;
    }[];
};

const getWellFormattedIngredient = (element: SubmodelElementWithValue) => {
    const ingredient = element?.value?.find((element) => element?.idShort == 'Ingredient')?.value;

    const quant = element?.value?.find((element) => element?.idShort == 'Quantity')?.value;

    const unit = element?.value?.find((element) => element?.idShort == 'Unit')?.value;

    return { ingredientName: ingredient, quantity: quant?.concat(unit ?? '') };
};

const getBOMOfCoffee = async (
    elementName: string,
    coffeeAASId: string,
    repositoryClient: AssetAdministrationShellRepositoryApi,
    submodelClient: SubmodelRepositoryApi,
) => {
    const submodelRefs = (await repositoryClient.getSubmodelReferencesFromShell(
        encodeBase64(coffeeAASId),
    )) as Reference[];
    const submodels = await Promise.all(submodelRefs.map((ref) => submodelClient.getSubmodelById(ref.keys[0].value)));

    const bomModel = submodels.find((sm) => sm.idShort == 'BillOfMaterial');

    const milkElement = bomModel?.submodelElements?.find(
        (element) => element.idShort == 'Milk',
    ) as unknown as SubmodelElementWithValue;
    const milk = getWellFormattedIngredient(milkElement);
    let milkIcon;
    if (milk.ingredientName?.toLowerCase()?.includes('oat')) {
        milkIcon = OatMilk;
    } else if (milk.ingredientName?.toLowerCase()?.includes('cow')) {
        milkIcon = CowMilk;
    } else {
        milkIcon = None;
        milk.quantity = 'None';
    }

    const sugarElement = bomModel?.submodelElements?.find(
        (element) => element.idShort == 'Sugar',
    ) as unknown as SubmodelElementWithValue;
    const sugar = getWellFormattedIngredient(sugarElement);
    let sugarIcon;
    if (sugar.ingredientName?.toLowerCase()?.includes('sugar')) {
        sugarIcon = Sugar;
    } else {
        sugarIcon = None;
        sugar.quantity = 'None';
    }

    const nameElement = bomModel?.submodelElements?.find(
        (element) => element.idShort == 'Name',
    ) as unknown as SubmodelElementWithValue;
    let coffeeIcon;
    const coffeeName = (nameElement?.value as unknown as string) ?? '';

    if (coffeeName.toLowerCase().includes('cappuccino')) {
        coffeeIcon = Cappuccino;
    } else if (coffeeName.toLowerCase().includes('coffe')) {
        coffeeIcon = Coffee;
    } else if (coffeeName.toLowerCase().includes('chai')) {
        coffeeIcon = Chai;
    } else if (coffeeName.toLowerCase().includes('double')) {
        coffeeIcon = EspressoDouble;
    } else if (coffeeName.toLowerCase().includes('espresso')) {
        coffeeIcon = Espresso;
    }

    return { coffeeName, coffeeIcon, milk, milkIcon, sugar, sugarIcon };
};

export function CoffeeConsumptionVisualizations(props: { submodel: Submodel }) {
    const [state, setState] = useState<Element[]>([]);

    const intl = useIntl();
    const { value } = (props.submodel.submodelElements?.at(0) as any) ?? [];
    const { repositoryClient, submodelClient } = useApis();

    useEffect(() => {
        Promise.all(
            value
                ?.filter((element: any) => {
                    const elementAASid: string = element.value.keys.at(0).value;

                    const elementName = elementAASid.split('/aas/')[1];

                    return (
                        elementAASid.includes('/aas/') &&
                        (element.idShort.includes(elementName) || element.idShort === elementName)
                    );
                })
                .reduce((accumulator: { elementName: string; element: any; count: number }[], element: any) => {
                    const elementAASid: string = element.value.keys.at(0).value;

                    const elementName = elementAASid.split('/aas/')[1];

                    const elementEntry = accumulator.find((item) => item.elementName === elementName);

                    if (!elementEntry) {
                        accumulator.push({ elementName, count: 1, element });
                    } else {
                        elementEntry.count++;
                    }

                    return accumulator;
                }, [])
                .map(async (value: { elementName: string; element: any; count: number }) => {
                    const elementAASid: string = value.element.value.keys.at(0).value;

                    const elementName = elementAASid.split('/aas/')[1];

                    const bomValues = await getBOMOfCoffee(elementName, elementAASid, repositoryClient, submodelClient);

                    return {
                        address: elementAASid.replace('/aas', ''),
                        elementName,
                        coffeeName: bomValues.coffeeName,
                        coffeeIcon: bomValues.coffeeIcon,
                        milk: bomValues.milk,
                        milkIcon: bomValues.milkIcon,
                        sugar: bomValues.sugar,
                        count: value.count,
                        sugarIcon: bomValues.sugarIcon,
                    };
                }),
        ).then((finalList) => {
            setState(finalList);
        });
    }, [value]);

    return (
        <div className="coffeeContainer">
            <style>
                {'.coffeeContainer {display: flex; flex-direction: column; justify-content: center; align-items: center}' +
                    'h3 { margin-top: 100px }' +
                    'th,td {padding: 12px 15px; }' +
                    'thead tr {background-color: #5e6b7c; color: #ffffff; text-align: center; }' +
                    '.ReferenceCounterTable {' +
                    'border-collapse: collapse;' +
                    'margin: 25px 0;' +
                    'box-shadow: 0 0 20px rgba(0, 0, 0, 0.15) }; ' +
                    'tbody tr { border-bottom: 1px solid #dddddd; }' +
                    'tbody tr:nth-of-type(even) { background-color: #f3f3f3; }' +
                    'tbody tr:last-of-type { border-bottom: 2px solid #5e6b7c; }' +
                    'tbody tr:hover { background-color: #DEE2E2;  cursor: pointer; }' +
                    '.elementCount {text-align: center}' +
                    'a { color: rgba(4, 20, 22, 0.87); text-decoration: none; }' +
                    '.arrow-column { min-width: 50px }' +
                    '.contents { text-align: center }' +
                    '.icon { max-width: 50px }' +
                    '.takeHome { max-width: 420px; margin-left: -30px }' +
                    '@media (max-width: 480px) {' +
                    '.takeHome {max-width: 90vw; height: auto;}' +
                    '.ReferenceCounterTable {width: 100%; height: auto;}' +
                    'th,td {padding: 5px 7px; font-size: 0.95em}}' +
                    '.initialHeadingStyle {text-align: center}' +
                    '.initialHeadingStyle a {color: #7a212e; text-decoration: underline}'}
            </style>
            {state && state.length > 0 ? (
                <>
                    <h1 className="coffeeHeadingStyle">
                        {intl.formatMessage(messages.mnestix.coffeeConsumption.title)}
                    </h1>
                    <table className="ReferenceCounterTable">
                        <thead>
                            <tr>
                                <th>{intl.formatMessage(messages.mnestix.coffeeConsumption.coffeeKind)}</th>
                                <th className="contents">Milk</th>
                                <th className="contents">Sugar</th>
                                <th className="contents">
                                    {intl.formatMessage(messages.mnestix.coffeeConsumption.drunken)}
                                </th>
                                <th className="arrow-column"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {state && state.length > 0 ? (
                                state.map((element) => {
                                    return (
                                        <tr
                                            key={element.elementName}
                                            onClick={() => (window.location.href = element.address ?? '')}
                                        >
                                            <td className="elementName">
                                                <img className="icon" src={element.coffeeIcon} alt="Coffee" />
                                                <br />
                                                {element.coffeeName}
                                            </td>
                                            <td className="contents">
                                                <img className="icon" src={element.milkIcon} alt="Milk" />
                                                <br />
                                                {element.milk.quantity}
                                            </td>
                                            <td className="contents">
                                                <img className="icon" src={element.sugarIcon} alt="Sugar" />
                                                <br />
                                                {element.sugar.quantity}
                                            </td>
                                            <td className="elementCount">{element.count}</td>
                                            <td className="arrow-column">
                                                <ArrowForward color="primary" />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr key="loading"></tr>
                            )}
                        </tbody>
                    </table>
                </>
            ) : (
                <h1 className="initialHeadingStyle">
                    {intl.formatMessage(messages.mnestix.coffeeConsumption.initialHeadingText)}
                    <a href="https://coffee.xitaso.com/en">
                        {intl.formatMessage(messages.mnestix.coffeeConsumption.initialHeadingLink)}
                    </a>
                </h1>
            )}
            <h3>What are the benefits of tracking your products with the AAS?</h3>
            <img className="takeHome" src={TakeHomeMessage} />
        </div>
    );
}
