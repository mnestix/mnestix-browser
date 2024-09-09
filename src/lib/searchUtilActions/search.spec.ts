import { expect } from '@jest/globals';
import { AasSearcher } from 'lib/searchUtilActions/searchServer';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { instance, mock } from 'ts-mockito';
import { decodeBase64, encodeBase64 } from 'lib/util/Base64Util';

interface SearchSetupParameters {
    discoveryEntries?: { assetId: string; aasIds: string[] }[];
    registryShellDescriptorEntries?: AssetAdministrationShellDescriptor[] | null;
    shellsByRegistryEndpoint?: { path: string; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepository?: AssetAdministrationShell[] | null;
}

interface DummyAasParameters {
    id?: string;
}

describe('Full Aas Search happy paths', () => {
    it('navigates to the discovery list when more than one aasId for a given assetId', async () => {
        const searchString = 'irrelevant assetId';
        const searcher = prepareSearcher({
            discoveryEntries: [{ assetId: searchString, aasIds: ['first found aasId 0', 'second found aasId 1'] }],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/discovery?assetId=' + searchString);
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const aasEndpoint = 'https://www.origin.com/route/for/aas/';
        const userInputString = 'irrelevant assetId';
        const searcher = prepareSearcher({
            discoveryEntries: [{ assetId: userInputString, aasIds: [aasId] }],
            registryShellDescriptorEntries: [createDummyShellDescriptor(aasEndpoint, aasId)],
            shellsByRegistryEndpoint: [{ path: aasEndpoint, aas: createDummyAas({ id: aasId }) }],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is not registered in the registry but saved in default repository', async () => {
        const aasId = 'dummy aasId';
        const userInputString = 'irrelevant assetId';
        const searcher = prepareSearcher({
            discoveryEntries: [{ assetId: userInputString, aasIds: [aasId] }],
            shellsSavedInTheRepository: [createDummyAas({ id: aasId })],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns details of aas when exactly when discovery returns nothing and the aas is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const userInputString = aasId;
        const aasEndpoint = 'https://www.origin.com/route/for/aas/';
        const searcher = prepareSearcher({
            registryShellDescriptorEntries: [createDummyShellDescriptor(aasEndpoint, aasId)],
            shellsByRegistryEndpoint: [{ path: aasEndpoint, aas: createDummyAas({ id: aasId }) }],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns aas for given aasId from default repository', async () => {
        const aasId = 'dummy aasId';
        const userInputString = aasId;
        const searcher = prepareSearcher({
            shellsSavedInTheRepository: [createDummyAas({ id: aasId })],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });
});

function prepareSearcher({
    discoveryEntries = [],
    registryShellDescriptorEntries = null,
    shellsByRegistryEndpoint = null,
    shellsSavedInTheRepository = null,
}: SearchSetupParameters = {}) {
    const discoveryServiceClient = new DiscoveryServiceApiInMemory({
        discoveryEntries: discoveryEntries,
    });
    const registryService = new RegistryServiceApiInMemory({ registryShellDescriptorEntries });
    const repositoryClient = new AssetAdministrationShellRepositoryApiInMemory({ shellsSavedInTheRepository });
    return new AasSearcher(
        discoveryServiceClient,
        registryService,
        repositoryClient,
        async (input: RequestInfo | URL): Promise<Response> => {
            if (!shellsByRegistryEndpoint) return Promise.reject(new Error('no registry configuration'));
            for (const aasEntry of shellsByRegistryEndpoint) {
                if (aasEntry.path === input) return new Response(JSON.stringify(aasEntry.aas));
            }
            return Promise.reject(new Error('no aas for on href:' + input));
        },
    );
}

class DiscoveryServiceApiInMemory implements IDiscoveryServiceApi {
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
                    result: discoveryEntry.aasIds,
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

class RegistryServiceApiInMemory implements IRegistryServiceApi {
    private registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null;
    baseUrl: string;

    constructor(options: { registryShellDescriptorEntries: AssetAdministrationShellDescriptor[] | null }) {
        this.registryShellDescriptorEntries = options.registryShellDescriptorEntries;
    }

    getAllAssetAdministrationShellDescriptors(): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    getAssetAdministrationShellDescriptorById(aasId: string): Promise<AssetAdministrationShellDescriptor> {
        if (!this.registryShellDescriptorEntries) return Promise.reject(new Error('no registry configuration'));
        let shellDescriptor: AssetAdministrationShellDescriptor;
        for (shellDescriptor of this.registryShellDescriptorEntries) {
            if (shellDescriptor.id === aasId) return Promise.resolve(shellDescriptor);
        }
        return Promise.reject(new Error('no shell descriptor for aasId:' + aasId));
    }

    postAssetAdministrationShellDescriptor(shellDescriptor: AssetAdministrationShellDescriptor): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    putAssetAdministrationShellDescriptorById(
        aasId: string,
        shellDescriptor: AssetAdministrationShellDescriptor,
    ): Promise<JSON> {
        throw new Error('Method not implemented.');
    }

    deleteAssetAdministrationShellDescriptorById(aasId: string): Promise<Response> {
        throw new Error('Method not implemented.');
    }
}

class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    private shellsSavedInTheRepository: AssetAdministrationShell[] | null | undefined;

    constructor(options: { shellsSavedInTheRepository: AssetAdministrationShell[] | null | undefined }) {
        this.shellsSavedInTheRepository = options.shellsSavedInTheRepository;
    }

    getAssetAdministrationShellById(
        aasId: string,
        options?: object | undefined,
        basePath?: string | undefined,
    ): Promise<AssetAdministrationShell> {
        if (!this.shellsSavedInTheRepository) return Promise.reject('no repository configuration');
        for (const aas of this.shellsSavedInTheRepository) {
            if (encodeBase64(aas.id) === aasId) return Promise.resolve(aas);
        }
        return Promise.reject(
            'no aas found in the default repository for aasId: ' +
                aasId +
                ', which is :' +
                decodeBase64(aasId) +
                ' encoded in base64',
        );
    }

    getSubmodelReferencesFromShell(aasId: string, options?: object | undefined): Promise<Reference[]> {
        throw new Error('Method not implemented.');
    }

    getThumbnailFromShell(aasId: string, options?: object | undefined, basePath?: string | undefined): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}

// would prefer to do without mocks but the objects are too complicated to instantiate
function createDummyAas({ id = 'irrelevant AasId' }: DummyAasParameters = {}) {
    const aas = mock(AssetAdministrationShell);
    const s = instance(aas);
    s.id = id;
    return s;
}

function createDummyShellDescriptor(href: string, id: string): AssetAdministrationShellDescriptor {
    return {
        endpoints: [
            {
                interface: 'AAS-3.0',
                protocolInformation: {
                    href: href,
                },
            },
        ],
        id: id,
    };
}
