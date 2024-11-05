import { expect } from '@jest/globals';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { instance, mock } from 'ts-mockito';
import { encodeBase64 } from 'lib/util/Base64Util';
import { Log } from 'lib/util/Log';
import { AasSearcher } from 'lib/services/search-actions/AasSearcher';

interface DummyAasParameters {
    id?: string;
}

const AAS_ENDPOINT = new URL('https://www.origin.com/route/for/aas/');

describe('Full Aas Search happy paths', () => {
    it('navigates to the discovery list when more than one aasId for a given assetId', async () => {
        const searchString = 'irrelevant assetId';
        const log = Log.createNull();
        const tracker = log.getTracker();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [
                { assetId: searchString, aasId: 'first found aasId 0' },
                { assetId: searchString, aasId: 'second found aasId 1' },
            ],
            log: log,
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/discovery?assetId=' + searchString);
        expect(tracker.getData()).toHaveLength(0);
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const searchString = 'irrelevant assetId';
        const aas = createDummyAas({ id: aasId });
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasId: aasId }],
            registryDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsOnRegistry: [{ endpoint: AAS_ENDPOINT, aas: aas }],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
        expect(search.result!.aas?.id).toEqual(aas.id);
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is not registered in the registry but saved in default repository', async () => {
        const aasId = 'dummy aasId';
        const searchString = 'irrelevant assetId';
        const aas = createDummyAas({ id: aasId });
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasId: aasId }],
            shellsInRepositories: [aas],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
        expect(search.result!.aas?.id).toEqual(aas.id);
    });

    it('returns details of aas when discovery returns nothing and the aas is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const aas = createDummyAas({ id: aasId });
        const searcher = AasSearcher.createNull({
            registryDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsOnRegistry: [{ endpoint: AAS_ENDPOINT, aas: aas }],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
        expect(search.result!.aas?.id).toEqual(aas.id);
    });

    it('returns aas for given aasId from default repository', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const aas = createDummyAas({ id: aasId });
        const searcher = AasSearcher.createNull({
            shellsInRepositories: [aas],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
        expect(search.result!.aas?.id).toEqual(aas.id);
    });

    it('returns aas for given aasId from foreign repository if only one found', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const aas = createDummyAas({ id: aasId });
        const searcher = AasSearcher.createNull({
            shellsInRepositories: [aas],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
        expect(search.result!.aas?.id).toEqual(aas.id);
    });

    it('returns aas for given aasId from foreign repository if two are found', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const searcher = AasSearcher.createNull({
            shellsInRepositories: [createDummyAas({ id: aasId }), createDummyAas({ id: aasId })],
        });

        const search = await searcher.performFullSearch(searchString);

        expect(search.isSuccess).toBeTruthy();
        expect(search.result!.redirectUrl).toBe('/viewer/discovery?assetId=' + searchString);
    });
});

describe('Full Aas Search edge cases', () => {
    it('logs to the console when finding nothing', async () => {
        const searchString = 'irrelevant assetId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            log: log,
        });

        await assertThatFunctionThrows(searcher, searchString);
    });

    it('throws when registry search failed', async () => {
        const searchString = 'irrelevant assetId';
        const aasId = 'irrelevantAasId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasId: aasId }],
            registryDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsOnRegistry: [
                {
                    endpoint: new URL(AAS_ENDPOINT + 'wrong path'),
                    aas: createDummyAas({ id: aasId }),
                },
            ],
            log: log,
        });

        await assertThatFunctionThrows(searcher, searchString);
    });

    it('throws when discovery search failed', async () => {
        const searchString = 'irrelevant assetId';
        const aasId = 'irrelevantAasId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: 'wrong asset Id', aasId: aasId }],
            registryDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsOnRegistry: [
                {
                    endpoint: new URL(AAS_ENDPOINT + 'wrong path'),
                    aas: createDummyAas({ id: aasId }),
                },
            ],
            log: log,
        });

        await assertThatFunctionThrows(searcher, searchString);
    });
});

// would prefer to do without mocks but the objects are too complicated to instantiate
function createDummyAas({ id = 'irrelevant AasId' }: DummyAasParameters = {}) {
    const aas = mock(AssetAdministrationShell);
    const s = instance(aas);
    s.id = id;
    return s;
}

function createDummyShellDescriptor(href: URL, id: string): AssetAdministrationShellDescriptor {
    return {
        endpoints: [
            {
                interface: 'AAS-3.0',
                protocolInformation: {
                    href: href.toString(),
                },
            },
        ],
        id: id,
    };
}

async function assertThatFunctionThrows(
    searcher: AasSearcher,
    searchString: string,
    partOfExpectedErrorMessage: string | null = null,
) {
    try {
        await searcher.performFullSearch(searchString);
        fail('Your method was expected to throw but did not throw at all.');
    } catch (e) {
        partOfExpectedErrorMessage && expect(e).toContain(partOfExpectedErrorMessage);
    }
}
