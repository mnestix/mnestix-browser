export function isValidUrl(urlString: string | null): boolean {
    if (!urlString) return false;

    let url;
    try {
        url = new URL(urlString);
    } catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}
