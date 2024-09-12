'use server';

export async function performServerFetch(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<string> {
    const result = await fetch(input, init);
    if (result.status >= 200 && result.status < 300) {
        return Promise.resolve(await result.text());
    } else throw result;
}
