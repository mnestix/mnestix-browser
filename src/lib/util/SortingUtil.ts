export const sortWithNullableValues = (a: string | null, b: string | null): number => {
    // put `null` values at the end
    if (!a) {
        return 1;
    }
    if (!b) {
        return -1;
    }
    return a.localeCompare(b);
};
