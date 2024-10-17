import {
    MultiLanguageProperty,
    SubmodelElementCollection,
} from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { SubmodelElementSemanticId } from 'lib/enums/SubmodelElementSemanticId.enum';
import { getTranslationText, hasSemanticId } from 'lib/util/SubmodelResolverUtil';
import { IntlShape } from 'react-intl';
import { TimeSeriesTimeFormat, TimeSeriesTimeFormatSemanticIds } from 'lib/enums/TimeSeriesTimeFormatSemanticIds.enum';
import { Property } from '@aas-core-works/aas-core3.0-typescript/types';

export type dataPoint = {
    timestamp: string;
    value: number | number[];
};

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

export function parseRecordsFromInternalSegment(submodelElement: SubmodelElementCollection) : dataPoint[] {
    // get records
    const recordsElement = submodelElement.value?.find((se) => hasSemanticId(se, SubmodelElementSemanticId.TimeSeriesRecords))
    if (!recordsElement) return []
    const records = (recordsElement as SubmodelElementCollection).value
    if (!records || !records?.length) return []

    // find record timestamp semantic id
    const firstRecord = records[0] as SubmodelElementCollection;
    const variables = firstRecord.value
    if (!variables || !variables.length) return []
    const variableSemIDs = variables.map((value) => (value.semanticId?.keys[0].value ?? '') as string)
    if (!variableSemIDs.length) return []
    const format = variableSemIDs.map((id) => TimeSeriesTimeFormatSemanticIds[id]).find((a) => a !== undefined) as TimeSeriesTimeFormat;
    if (format === undefined) return []

    // semantic id of record timestamps
    const targetSemID = Object.keys(TimeSeriesTimeFormatSemanticIds)[Object.values(TimeSeriesTimeFormatSemanticIds).indexOf(format)]

    // parse data
    // TODO time format
    // TODO data format
    return records.map((record: SubmodelElementCollection) => {
        const vars = (record.value as Property[])
        const timeVar = vars.find(value => hasSemanticId(value, targetSemID));
        const dataVars = vars.filter((v) => v !== timeVar);
        const numbers = dataVars.map((v) => Number.parseFloat(v.value ?? '0'))

        if (timeVar) {
            return { timestamp: (new Date(Number.parseFloat(timeVar.value ?? '0'))).toString(), value: numbers }
        }
        return { timestamp: '', value: numbers };
    })
}
