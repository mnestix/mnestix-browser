import { encodeBase64 } from 'lib/util/Base64Util';

export class DiscoveryServiceApi {
    baseUrl: string;

    constructor(protected _baseUrl: string = '') {
        this.baseUrl = _baseUrl;
    }

    public async linkAasIdAndAssetId(aasId: string, assetId: string) {
        return this.postAllAssetLinksById(aasId, [
            {
                name: 'globalAssetId',
                value: assetId,
            },
        ]);
    }

    public async getAasIdsByAssetId(assetId: string) {
        return this.getAllAssetAdministrationShellIdsByAssetLink([
            {
                name: 'globalAssetId',
                value: assetId,
            },
        ]);
    }

    public async deleteAllAssetLinksById(aasId: string) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const response = await fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'DELETE',
            headers,
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    public async getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: { name: string; value: string }[],
    ): Promise<{ paging_metadata: string; result: string[] }> {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/lookup/shells`);

        assetIds.forEach((obj) => {
            url.searchParams.append('assetIds', encodeBase64(JSON.stringify(obj)));
        });

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    public async getAllAssetLinksById(aasId: string) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const response = await fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'GET',
            headers,
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }

    public async postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const response = await fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(assetLinks),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    }
}
