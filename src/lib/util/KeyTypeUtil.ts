import { Class, KeyTypes } from '@aas-core-works/aas-core3.0-typescript/types';

export function getKeyType(el: Class) {
    try {
        const jsonable = JSON.parse(JSON.stringify(el));

        try {
            // Detailed explanation on why this works: https://stackoverflow.com/a/62764510
            return KeyTypes[jsonable.modelType as keyof typeof KeyTypes];
        } catch (_) {
            return KeyTypes.SubmodelElement;
        }
    } catch (error: unknown) {
        return NaN;
    }
}
