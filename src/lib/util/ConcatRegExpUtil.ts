export function concatRegExp(first: RegExp, second: RegExp) {
    let flags = first.flags + second.flags;
    flags = Array.from(new Set(flags.split(''))).join();
    return new RegExp(first.source + second.source, flags);
}
