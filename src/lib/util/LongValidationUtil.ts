// matches positive and negative longs, for example: -10, 5, 101, ... Also matches 0.
const longRegExp = new RegExp(/^([-]?[1-9]\d*|0)$/);

export const isValidLong = (str: string) => {
    return longRegExp.test(str);
};
