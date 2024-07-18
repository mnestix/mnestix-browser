'use client';
import { encodeBase64 } from 'lib/util/Base64Util';

export async function isAasAvailableInRepo(aasId: string, url: string | undefined) {
    const b64_aasId = encodeBase64(aasId);

    const localRepoUrl = url ? `${url}/shells/${b64_aasId}` : '';

    if (!localRepoUrl) {
        return false;
    }

    try {
        const response = await fetch(localRepoUrl, { method: 'HEAD' });

        return response.status === 200;
    } catch (e) {
        console.error('Request failed', e);
        return false;
    }
}
