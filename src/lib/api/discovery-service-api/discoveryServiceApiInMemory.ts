import { DiscoveryEntry, IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { ApiResponseWrapper, ApiResponseWrapperUtil, ApiResultStatus } from 'lib/services/apiResponseWrapper';

export class DiscoveryServiceApiInMemory implements IDiscoveryServiceApi {
    private discoveryEntries: { assetId: string; aasIds: string[] }[];

    constructor(options: { discoveryEntries: { assetId: string; aasIds: string[] }[] }) {
        this.discoveryEntries = options.discoveryEntries;
    }

    linkAasIdAndAssetId(_aasId: string, _assetId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }

    getAasIdsByAssetId(assetId: string): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        for (const discoveryEntry of this.discoveryEntries) {
            if (discoveryEntry.assetId === assetId)
                return Promise.resolve(ApiResponseWrapperUtil.fromSuccess({
                    paging_metadata: '',
                    result: discoveryEntry.aasIds,
                }));
        }
        return Promise.resolve(ApiResponseWrapperUtil.fromErrorCode(ApiResultStatus.NOT_FOUND, 'not found'));
    }

    deleteAllAssetLinksById(_aasId: string): Promise<ApiResponseWrapper<void>> {
        throw new Error('Method not implemented.');
    }

    getAllAssetAdministrationShellIdsByAssetLink(_assetIds: { name: string; value: string }[]): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>> {
        throw new Error('Method not implemented.');
    }

    getAllAssetLinksById(_aasId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }

    postAllAssetLinksById(_aasId: string, _assetLinks: DiscoveryEntry[]): Promise<ApiResponseWrapper<DiscoveryEntry[]>> {
        throw new Error('Method not implemented.');
    }
}
