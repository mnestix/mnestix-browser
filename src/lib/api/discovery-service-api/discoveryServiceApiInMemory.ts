import { DiscoveryEntry, IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export class DiscoveryServiceApiInMemory implements IDiscoveryServiceApi {
    constructor(
        protected baseUrl: string,
        protected discoveryEntries: { assetId: string; aasIds: string[] }[],
    ) {}

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async linkAasIdAndAssetId(_aasId: string, _assetId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }

    async getAasIdsByAssetId(
        assetId: string,
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        const foundEntry = this.discoveryEntries.find((entry) => entry.assetId === assetId);
        if (!foundEntry) {
            return Promise.resolve(
                wrapErrorCode(
                    ApiResultStatus.NOT_FOUND,
                    `No AAS with ID '${assetId}' found in Discovery '${this.baseUrl}'`,
                ),
            );
        }

        return Promise.resolve(
            wrapSuccess({
                paging_metadata: '',
                result: foundEntry.aasIds,
            }),
        );
    }

    async deleteAllAssetLinksById(_aasId: string): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    async getAllAssetAdministrationShellIdsByAssetLink(
        _assetIds: { name: string; value: string }[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        throw new Error('Method not implemented.');
    }

    async getAllAssetLinksById(_aasId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }

    async postAllAssetLinksById(
        _aasId: string,
        _assetLinks: DiscoveryEntry[],
    ): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }
}
