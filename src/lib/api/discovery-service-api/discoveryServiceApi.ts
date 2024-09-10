import { encodeBase64 } from 'lib/util/Base64Util';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { DiscoveryServiceApiInMemory } from 'lib/api/discovery-service-api/discoveryServiceApiInMemory';

export class DiscoveryServiceApi implements IDiscoveryServiceApi {
    baseUrl: string;

    private constructor(protected _baseUrl: string = '') {
        this.baseUrl = _baseUrl;
    }

    static create(_baseUrl: string = ''): DiscoveryServiceApi {
        return new DiscoveryServiceApi(_baseUrl);
    }

    static createNull(options: {
        discoveryEntries: { assetId: string; aasIds: string[] }[];
    }): DiscoveryServiceApiInMemory {
        return new DiscoveryServiceApiInMemory(options);
    }

    async linkAasIdAndAssetId(aasId: string, assetId: string) {
        return this.postAllAssetLinksById(aasId, [
            {
                name: 'globalAssetId',
                value: assetId,
            },
        ]);
    }

    async getAasIdsByAssetId(assetId: string) {
        return this.getAllAssetAdministrationShellIdsByAssetLink([
            {
                name: 'globalAssetId',
                value: assetId,
            },
        ]);
    }

    async deleteAllAssetLinksById(aasId: string) {
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

    async getAllAssetAdministrationShellIdsByAssetLink(
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

    async getAllAssetLinksById(aasId: string) {
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

    async postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]) {
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
