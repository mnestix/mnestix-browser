import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { SpecificAssetId } from '@aas-core-works/aas-core3.0-typescript/types';

export type DiscoveryEntry = {
    aasId: string;
    asset: SpecificAssetId;
};

export interface IDiscoveryServiceApi {
    /**
     * Returns the base URL of this discovery endpoint.
     */
    getBaseUrl(): string;

    /**
     * Post a single AAS - asset link to the discovery service.
     * @param aasId the ID of the AAS.
     * @param assetId the ID of the asset.
     */
    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<ApiResponseWrapper<DiscoveryEntry>>;

    /**
     * Returns a list of all AAS IDs for the given global assetId.
     * @param assetId The asset ID to search for.
     */
    getAasIdsByAssetId(assetId: string): Promise<ApiResponseWrapper<string[]>>;

    /**
     * Returns a list of Asset Administration Shell ids based on asset identifier key-value-pairs.
     * @param assetIds The specific assetId of an asset identifier, which could be the globalAssetId or specificAssetIds.
     * @return Identifiers of all Asset Administration Shells which contain all asset identifier key-value-pairs in their asset information, i.e. AND-match of key-value-pairs per Asset Administration Shell.
     */
    getAllAssetAdministrationShellIdsByAssetLink(assetIds: SpecificAssetId[]): Promise<ApiResponseWrapper<string[]>>;

    /**
     * Returns a list of asset identifier key-value-pairs based on an Asset Administration Shell id to edit discoverable content.
     * @param aasId The Asset Administration Shell’s unique id.
     * @return Requested asset identifier, which could be the globalAssetId or specificAssetIds.
     */
    getAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<SpecificAssetId[]>>;

    /**
     * Creates new asset identifier key-value-pairs linked to an Asset Administration Shell for discoverable content. The existing content might have to be deleted first.
     * @param aasId The Asset Administration Shell’s unique id.
     * @param assetLinks Asset identifier, which could be the globalAssetId or specificAssetIds.
     * @return Asset identifier created successfully.
     *
     * @remarks The specification explicitly gives a cardinality of one here.
     */
    postAllAssetLinksById(aasId: string, assetLinks: SpecificAssetId): Promise<ApiResponseWrapper<SpecificAssetId>>;

    /**
     * Deletes all asset identifier key-value-pairs linked to an Asset Administration Shell to edit discoverable content.
     * @param aasId The Asset Administration Shell’s unique id.
     */
    deleteAllAssetLinksById(aasId: string): Promise<ApiResponseWrapper<void>>;
}
