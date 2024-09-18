import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';

export class DiscoveryServiceApiInMemory implements IDiscoveryServiceApi {
    private discoveryEntries: { assetId: string; aasIds: string[] }[];

    constructor(options: { discoveryEntries: { assetId: string; aasIds: string[] }[] }) {
        this.discoveryEntries = options.discoveryEntries;
    }

    linkAasIdAndAssetId(_aasId: string, _assetId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAasIdsByAssetId(assetId: string): Promise<{ paging_metadata: string; result: string[] }> {
        for (const discoveryEntry of this.discoveryEntries) {
            if (discoveryEntry.assetId === assetId)
                return Promise.resolve({
                    paging_metadata: '',
                    result: discoveryEntry.aasIds,
                });
        }
        return Promise.reject('not found');
    }

    deleteAllAssetLinksById(_aasId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAllAssetAdministrationShellIdsByAssetLink(_assetIds: { name: string; value: string }[]): Promise<{
        paging_metadata: string;
        result: string[];
    }> {
        throw new Error('Method not implemented.');
    }

    getAllAssetLinksById(_aasId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    postAllAssetLinksById(_aasId: string, _assetLinks: { name: string; value: string }[]): Promise<JSON> {
        throw new Error('Method not implemented.');
    }
}
