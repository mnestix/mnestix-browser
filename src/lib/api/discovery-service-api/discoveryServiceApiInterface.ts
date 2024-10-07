export interface IDiscoveryServiceApi {
    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<JSON>;

    getAasIdsByAssetId(assetId: string): Promise<{ paging_metadata: string; result: string[] }>;

    deleteAllAssetLinksById(aasId: string): Promise<JSON>;

    getAllAssetAdministrationShellIdsByAssetLink(
        assetIds: { name: string; value: string }[],
    ): Promise<{ paging_metadata: string; result: string[] }>;

    getAllAssetLinksById(aasId: string): Promise<JSON>;

    postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]): Promise<JSON>;
}