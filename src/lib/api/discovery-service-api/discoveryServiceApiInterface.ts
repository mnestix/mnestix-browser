import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

export type DiscoveryEntry = {
    name: string;
    value: string;
};

export interface IDiscoveryServiceApi {
    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<ApiResponseWrapper<string>>;

    getAasIdsByAssetId(assetId: string): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    deleteAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<void>>;

    getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: DiscoveryEntry[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<string[]>>;

    postAllAssetLinksById(
        aasId: string,
        assetLinks: DiscoveryEntry[],
    ): Promise<ApiResponseWrapper<DiscoveryEntry[]>>;
}
