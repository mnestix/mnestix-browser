import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';

export class DiscoveryServiceApiInMemory implements IDiscoveryServiceApi {
    private discoveryEntries: { assetId: string; aasIds: string[] }[];

    constructor(options: { discoveryEntries: { assetId: string; aasIds: string[] }[] }) {
        this.discoveryEntries = options.discoveryEntries;
    }

    linkAasIdAndAssetId(aasId: string, assetId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAasIdsByAssetId(assetId: string): Promise<{ paging_metadata: string; result: string[] }> {
        for (const discoveryEntry of this.discoveryEntries) {
            if (discoveryEntry.assetId === assetId)
                return Promise.resolve({
                    paging_metadata: '',
                    result: discoveryEntry.aasIds
                });
        }
        return Promise.reject('not found');
    }

    deleteAllAssetLinksById(aasId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAllAssetAdministrationShellIdsByAssetLink(assetIds: { name: string; value: string }[]): Promise<{
        // const registryService = new ;
        // const repositoryClient = new ;
        paging_metadata: string;
        result: string[];
    }> {
        throw new Error('Method not implemented.');
    }

    getAllAssetLinksById(aasId: string): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    postAllAssetLinksById(aasId: string, assetLinks: { name: string; value: string }[]): Promise<JSON> {
        throw new Error('Method not implemented.');
    }
}