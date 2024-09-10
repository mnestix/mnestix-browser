import { expect } from '@jest/globals';
import { AasSearcher } from 'lib/searchUtilActions/searchServer';
import { AssetAdministrationShellDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { instance, mock } from 'ts-mockito';
import { encodeBase64 } from 'lib/util/Base64Util';

interface DummyAasParameters {
    id?: string;
}

describe('Full Aas Search happy paths', () => {
    it('navigates to the discovery list when more than one aasId for a given assetId', async () => {
        const searchString = 'irrelevant assetId';
        const searcher = AasSearcher.createNull({
            discoveryEntries: [{ assetId: searchString, aasIds: ['first found aasId 0', 'second found aasId 1'] }],
        });

        const result = await searcher.fullSearch(searchString);

        expect(result.redirectUrl).toBe('/viewer/discovery?assetId=' + searchString);
    });

    it('returns details of aas when exactly one aasId for a given assetId and it is registered in the registry', async () => {
        const aasId = 'dummy aasId';
        const aasEndpoint = 'https://www.origin.com/route/for/aas/';
        const userInputString = 'irrelevant assetId';
        const searcher = AasSearcher.createNull({
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
        const searcher = AasSearcher.createNull({
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
        const searcher = AasSearcher.createNull({
            registryShellDescriptorEntries: [createDummyShellDescriptor(aasEndpoint, aasId)],
            shellsByRegistryEndpoint: [{ path: aasEndpoint, aas: createDummyAas({ id: aasId }) }],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
    });

    it('returns aas for given aasId from default repository', async () => {
        const aasId = 'dummy aasId';
        const userInputString = aasId;
        const searcher = AasSearcher.createNull({
            shellsSavedInTheRepository: [createDummyAas({ id: aasId })],
        });

        const result = await searcher.fullSearch(userInputString);

        expect(result.redirectUrl).toBe('/viewer/' + encodeBase64(aasId));
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
