import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export type DiscoveryEntry = {
    name: string;
    value: string;
};

export interface IDiscoveryServiceApi {
    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>>;

    getAasIdsByAssetId(assetId: string): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    deleteAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<void>>;

    getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: DiscoveryEntry[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<DiscoveryEntry[]>>;

    postAllAssetLinksById(
        aasId: string,
        assetLinks: DiscoveryEntry[],
        apiKey?: string,
    ): Promise<ApiResponseWrapper<DiscoveryEntry[]>>;
}
