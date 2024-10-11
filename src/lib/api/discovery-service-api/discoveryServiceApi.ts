import { encodeBase64 } from 'lib/util/Base64Util';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { DiscoveryServiceApiInMemory } from 'lib/api/discovery-service-api/discoveryServiceApiInMemory';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

export class DiscoveryServiceApi implements IDiscoveryServiceApi {
    baseUrl: string;

    private constructor(
        protected _baseUrl: string = '',
        protected http: {
            fetch(url: RequestInfo, init?: RequestInit): Promise<ApiResponseWrapper<string>>;
        },
    ) {
        this.baseUrl = _baseUrl;
    }

    static create(
        _baseUrl: string = '',
        http: {
            fetch(url: RequestInfo, init?: RequestInit): Promise<ApiResponseWrapper<string>>;
        },
    ): DiscoveryServiceApi {
        return new DiscoveryServiceApi(_baseUrl, http);
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

        const response = await this.http.fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'DELETE',
            headers,
        });

        return response.transformResult(JSON.parse)
    }

    async getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: { name: string; value: string }[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`${this.baseUrl}/lookup/shells`);

        assetIds.forEach((obj) => {
            url.searchParams.append('assetIds', encodeBase64(JSON.stringify(obj)));
        });

        const response = await this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        return response.transformResult<{ paging_metadata: string; result: string[] }>(JSON.parse)
    }

    async getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<string[]>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const response = await this.http.fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'GET',
            headers,
        });

        return response.transformResult<string []>(JSON.parse)
    }

    async postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]) {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const response = await this.http.fetch(`${this.baseUrl}/lookup/shells/${b64_aasId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(assetLinks),
        });

        return response.transformResult(JSON.parse)
    }
}
