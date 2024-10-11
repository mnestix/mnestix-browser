import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';

export interface IDiscoveryServiceApi {
    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<ApiResponseWrapper<JSON>>;

    getAasIdsByAssetId(assetId: string): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    deleteAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<JSON>>;

    getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: { name: string; value: string }[],
    ): Promise<ApiResponseWrapper<{ paging_metadata: string; result: string[] }>>;

    getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<string[]>>;

    postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]): Promise<ApiResponseWrapper<JSON>>;
}