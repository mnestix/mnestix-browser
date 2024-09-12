'use server';

export async function performServerFetch(
    input: string | Request | URL,
    init?: RequestInit | undefined,
): Promise<Response> {
    return await fetch(input, init)!;
}
