import { encodeBase64 } from 'lib/util/Base64Util';
import { DiscoveryEntry, IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { DiscoveryServiceApiInMemory } from 'lib/api/discovery-service-api/discoveryServiceApiInMemory';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class DiscoveryServiceApi implements IDiscoveryServiceApi {
    private constructor(
        protected baseUrl: string,
        protected http: {
            fetch<T>(url: RequestInfo, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
    ) {}

    static create(
        baseUrl: string,
        http: {
            fetch<T>(url: RequestInfo, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
    ): DiscoveryServiceApi {
        return new DiscoveryServiceApi(baseUrl, http);
    }

    static createNull(
        baseUrl: string,
        discoveryEntries: { assetId: string; aasIds: string[] }[],
    ): DiscoveryServiceApiInMemory {
        return new DiscoveryServiceApiInMemory(baseUrl, discoveryEntries);
    }

    getBaseUrl(): string {
        return this.baseUrl;
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

    async deleteAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<void>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`lookup/shells/${b64_aasId}`, this.baseUrl);
        return this.http.fetch(url.toString(), {
            method: 'DELETE',
            headers,
        });
    }

    async getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: { name: string; value: string }[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`lookup/shells`, this.baseUrl);

        assetIds.forEach((obj) => {
            url.searchParams.append('assetIds', encodeBase64(JSON.stringify(obj)));
        });

        return this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });
    }

    async getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`lookup/shells/${b64_aasId}`, this.baseUrl);
        return this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });
    }

    async postAllAssetLinksById(
        aasId: string,
        assetLinks: DiscoveryEntry[],
    ): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        const b64_aasId = encodeBase64(aasId);

        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        const url = new URL(`lookup/shells/${b64_aasId}`, this.baseUrl);
        return this.http.fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(assetLinks),
        });
    }
}
