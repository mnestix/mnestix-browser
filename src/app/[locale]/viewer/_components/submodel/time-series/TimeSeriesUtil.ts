import {
    MultiLanguageProperty,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { getTranslationText, hasSemanticId } from 'lib/util/SubmodelResolverUtil';
import { IntlShape } from 'react-intl';
import { TimeSeriesTimeFormat, TimeSeriesTimeFormatSemanticIds } from 'lib/enums/TimeSeriesTimeFormatSemanticIds.enum';
import { Property } from '@aas-core-works/aas-core3.0-typescript/types';

export type DataSet = {
    points: DataPoint[]
    names: string[];
};
export type DataPoint = {[key: string]: number | string};

export function extractValueBySemanticId(
    submodelElementCollection: SubmodelElementCollection,
    semanticId: SubmodelElementSemanticId,
) {
    return submodelElementCollection.value?.find((v) => hasSemanticId(v, semanticId));
}

export function extractIntlValueBySemanticId(
    submodelElementCollection: SubmodelElementCollection,
    semanticId: SubmodelElementSemanticId,
    intl: IntlShape,
) {
    const multiLanguageProperty: MultiLanguageProperty | undefined = extractValueBySemanticId(
        submodelElementCollection,
        semanticId,
    ) as MultiLanguageProperty;
    return multiLanguageProperty ? getTranslationText(multiLanguageProperty, intl) : '';
}

export function convertRecordTimeToDate(timeProp: Property): string | null {
    if (!timeProp.value) return null;

    const format = timeProp.valueType as unknown as string;
    switch (format) {
        case 'xs:long':
            return new Date(Number.parseFloat(timeProp.value)).toISOString();

        case 'xs:dateTime':
        case 'xs:time':
        case 'xs:date':
            return new Date(timeProp.value).toISOString();

        default:
            return null;
    }
}

export function parseRecordsFromInternalSegment(submodelElement: SubmodelElementCollection): DataSet | null {
    // get records
    const recordsElement = submodelElement.value?.find((se) =>
        hasSemanticId(se, SubmodelElementSemanticId.TimeSeriesRecords),
    );
    if (!recordsElement) return null;
    const records = (recordsElement as SubmodelElementCollection).value;
    if (!records || !records?.length) return null;

    // find record timestamp semantic id
    const firstRecord = records[0] as SubmodelElementCollection;
    const variables = firstRecord.value;
    if (!variables || !variables.length) return null;
    const variableSemIDs = variables.map((value) => (value.semanticId?.keys[0].value ?? '') as string);
    if (!variableSemIDs.length) return null;
    const format = variableSemIDs
        .map((id) => TimeSeriesTimeFormatSemanticIds[id])
        .find((a) => a !== undefined) as TimeSeriesTimeFormat;
    if (format === undefined) return null;

    // semantic id of record timestamps
    const targetSemID = Object.keys(TimeSeriesTimeFormatSemanticIds)[
        Object.values(TimeSeriesTimeFormatSemanticIds).indexOf(format)
    ];

    const namesSet = new Set<string>()

    // parse data
    const points = records.map((record: SubmodelElementCollection) => {
        const vars = record.value as Property[];
        const timeVar = vars.find((value) => hasSemanticId(value, targetSemID));
        const dataVars = vars.filter((v) => v !== timeVar);
        const point : DataPoint = {}

        dataVars.forEach((v, index) => {
            const name = v.idShort ?? index.toString()
            namesSet.add(name)
            point[name] = Number.parseFloat(v.value ?? '0')
        });
        point['timestamp'] = timeVar ? (convertRecordTimeToDate(timeVar) ?? '') : ''
        return point
    });

    return { points: points, names: Array.from(namesSet) };
}
