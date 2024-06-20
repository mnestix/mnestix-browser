export function cutDecimalPlaces(number: number, maxDecimalPlaces: number) {
    const factor = Math.pow(10, maxDecimalPlaces);
    return Math.round(number * factor) / factor;
}
