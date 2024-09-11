import { expect } from '@jest/globals';
import { AasSearcher } from 'lib/searchUtilActions/searchServer';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { instance, mock } from 'ts-mockito';
import { encodeBase64 } from 'lib/util/Base64Util';
import { Log, LogEntry } from 'lib/util/Log';

interface DummyAasParameters {
    id?: string;
}

const AAS_ENDPOINT = 'https://www.origin.com/route/for/aas/';


describe('Full Aas Search happy paths', () => {
    it('navigates to the discovery list when more than one aasId for a given assetId', async () => {
        const searchString = 'irrelevant assetId';
        const log = Log.createNull();
        const tracker = log.getTracker();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasIds: ['first found aasId 0', 'second found aasId 1'] }],
            log: log,
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/discovery?assetId=' + searchString);
        expect(tracker.getData()).toHaveLength(0);
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const searchString = 'irrelevant assetId';
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasIds: [aasId] }],
            registryShellDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsByRegistryEndpoint: [{ path: AAS_ENDPOINT, aas: createDummyAas({ id: aasId }) }],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is not registered in the registry but saved in default repository', async () => {
        const aasId = 'dummy aasId';
        const searchString = 'irrelevant assetId';
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasIds: [aasId] }],
            shellsSavedInTheRepository: [createDummyAas({ id: aasId })],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns details of aas when exactly when discovery returns nothing and the aas is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const searcher = AasSearcher.createNull({
            registryShellDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsByRegistryEndpoint: [{ path: AAS_ENDPOINT, aas: createDummyAas({ id: aasId }) }],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns aas for given aasId from default repository', async () => {
        const aasId = 'dummy aasId';
        const searchString = aasId;
        const searcher = AasSearcher.createNull({
            shellsSavedInTheRepository: [createDummyAas({ id: aasId })],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });
});

describe('Full Aas Search edge cases', () => {
    it('logs to the console when finding nothing', async () => {
        const searchString = 'irrelevant assetId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [],
            registryShellDescriptorEntries: [],
            shellsByRegistryEndpoint: [],
            shellsSavedInTheRepository: [],
            log: log,
        });

        await assertThatFunctionThrows(searcher, searchString, 'no aas found in the default repository for aasId');
    });

    it('throws when registry search failed', async () => {
        const searchString = 'irrelevant assetId';
        const aasId = 'irrelevantAasId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasIds: [aasId] }],
            registryShellDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsByRegistryEndpoint: [{ path: AAS_ENDPOINT + 'wrong path', aas: createDummyAas({ id: aasId }) }],
            log: log,
        });

        await assertThatFunctionThrows(searcher, searchString);
    });

    it('throws when discovery search failed', async () => {
        const searchString = 'irrelevant assetId';
        const aasId = 'irrelevantAasId';
        const log = Log.createNull();
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: 'wrong asset Id', aasIds: [aasId] }],
            registryShellDescriptorEntries: [createDummyShellDescriptor(AAS_ENDPOINT, aasId)],
            shellsByRegistryEndpoint: [{ path: AAS_ENDPOINT + 'wrong path', aas: createDummyAas({ id: aasId }) }],
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

// Todo: Are you good at typescript? There must be a better way to it!
//     await expect(searcher.fullSearch(searchString)).rejects.toThrow(); does not work for some reason...
async function assertThatFunctionThrows(
    searcher: AasSearcher,
    searchString: string,
    partOfExpectedErrorMessage: string | null = null,
) {
    try {
        await searcher.fullSearch(searchString);
        fail('Your method was expected to throw but did not throw at all.');
    } catch (e) {
        partOfExpectedErrorMessage && expect(e).toContain(partOfExpectedErrorMessage);
    }
}
