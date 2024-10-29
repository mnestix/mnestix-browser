export default function toBase64(input: string): string {
    return btoa(input).replace(/=+$/g, '');
}
