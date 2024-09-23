import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Log } from 'lib/util/Log';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    MultipleRepositorySearchService,
    NullableMultipleDataSourceSetupParameters,
} from 'lib/services/MultipleRepositorySearch/MultipleRepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';

interface NullableSearchSetupParameters {
    discoveryEntries?: { assetId: string; aasIds: string[] }[];
    registryShellDescriptorEntries?: AssetAdministrationShellDescriptor[] | null;
    shellsAvailableOnRegistryEndpoints?: { endpoint: URL; aas: AssetAdministrationShell }[] | null;
    shellsSavedInTheRepositories?: INullableAasRepositoryEntries[] | null;
    submodelsSavedInTheRepository?: Submodel[] | null;
    entitiesInMultipleDataSources?: NullableMultipleDataSourceSetupParameters | null;
    log?: Log | null;
}

export type AasData = {
    submodelDescriptors: SubmodelDescriptor[] | undefined;
    aasRegistryRepositoryOrigin: string | undefined;
};

export type AasSearchResult = {
    redirectUrl: string;
    aas: AssetAdministrationShell | null;
    aasData: AasData | null;
};

export type RegistrySearchResult = {
    endpoints: URL[];
    submodelDescriptors: SubmodelDescriptor[];
};

export class AasSearcher {
    private constructor(
        protected readonly discoveryServiceClient: IDiscoveryServiceApi,
        protected readonly registryService: IRegistryServiceApi,
        protected readonly multipleDataSource: MultipleRepositorySearchService,
        protected readonly log: Log,
    ) {}

    static create(_baseUrl: string = ''): AasSearcher {
        const multipleDataSource = MultipleRepositorySearchService.create();
        const registryServiceClient = RegistryServiceApi.create(process.env.REGISTRY_API_URL, mnestixFetch());
        const discoveryServiceClient = DiscoveryServiceApi.create(process.env.DISCOVERY_API_URL, mnestixFetch());
        const log = Log.create();
        return new AasSearcher(discoveryServiceClient, registryServiceClient, multipleDataSource, log);
    }

    static createNull({
        discoveryEntries = [],
        registryShellDescriptorEntries = [],
        shellsAvailableOnRegistryEndpoints = [],
        shellsSavedInTheRepositories = [],
        submodelsSavedInTheRepository = [],
        log = null,
    }: NullableSearchSetupParameters = {}): AasSearcher {
        return new AasSearcher(
            DiscoveryServiceApi.createNull({ discoveryEntries: discoveryEntries }),
            RegistryServiceApi.createNull({
                registryShellDescriptorEntries: registryShellDescriptorEntries,
                shellsAvailableOnEndpoints: shellsAvailableOnRegistryEndpoints,
            }),
            MultipleRepositorySearchService.createNull({
                shellsSavedInTheRepositories: shellsSavedInTheRepositories,
                submodelsSavedInTheRepository,
            }),
            log ?? Log.createNull(),
        );
    }

    async performFullSearch(searchInput: string): Promise<AasSearchResult> {
        const aasIds = await this.performAasDiscoverySearch(searchInput);
        const foundMultipleDiscoveryResults = aasIds && aasIds.length > 1;
        const foundOneDiscoveryResult = aasIds && aasIds.length === 1;

        if (foundMultipleDiscoveryResults) {
            return this.createDiscoveryRedirectResult(searchInput);
        }

        const aasId = foundOneDiscoveryResult ? aasIds[0] : searchInput;
        const aasIdEncoded = encodeBase64(aasId);

        const aasRegistryResult = await this.performRegistrySearch(aasId);
        if (aasRegistryResult) {
            return aasRegistryResult;
        }

        const defaultResult = await this.multipleDataSource.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult) {
            return this.createAasResult(defaultResult);
        }

        const potentiallyMultipleAas = await this.multipleDataSource.getAasFromAllRepos(aasIdEncoded);
        if (potentiallyMultipleAas.length > 1) {
            return this.createDiscoveryRedirectResult(searchInput);
        }
        return this.createAasResult(potentiallyMultipleAas[0].aas);
    }

    // TODO: handle multiple endpoints as result
    public async performRegistrySearch(searchAasId: string): Promise<AasSearchResult | null> {
        const registrySearchResult = await this.performAasRegistrySearch(searchAasId);
        if (!registrySearchResult) {
            return null;
        }
        const endpoint = registrySearchResult.endpoints[0];

        const aas = await this.getAasFromEndpoint(endpoint);
        if (!aas) {
            return null;
        }
        const data = {
            submodelDescriptors: registrySearchResult.submodelDescriptors,
            aasRegistryRepositoryOrigin: endpoint.origin,
        };
        return this.createAasResult(aas, data);
    }

    public async performAasDiscoverySearch(searchAssetId: string): Promise<string[] | null> {
        try {
            return (await this.discoveryServiceClient.getAasIdsByAssetId(searchAssetId)).result;
        } catch (e) {
            this.log.warn('Could not be found in the discovery service, will continue to look in the AAS registry');
            return null;
        }
        return null;
    }

    private createAasResult(aas: AssetAdministrationShell, data?: AasData): AasSearchResult {
        return {
            redirectUrl: `/viewer/${encodeBase64(aas.id)}`,
            aas: aas,
            aasData: data || null,
        };
    }

    private createDiscoveryRedirectResult(searchInput: string): AasSearchResult {
        return {
            redirectUrl: `/viewer/discovery?assetId=${searchInput}`,
            aas: null,
            aasData: null,
        };
    }

    private async performAasRegistrySearch(searchAasId: string): Promise<RegistrySearchResult | null> {
        try {
            const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
            const endpoints = shellDescription.endpoints as Endpoint[];
            const submodelDescriptors = shellDescription.submodelDescriptors as SubmodelDescriptor[];
            const endpointUrls = endpoints.map((endpoint) => new URL(endpoint.protocolInformation.href));
            return {
                endpoints: endpointUrls,
                submodelDescriptors: submodelDescriptors,
            };
        } catch (e) {
            this.log.warn('Could not be found in the registry service, will continue to look in the AAS repository');
            return null;
        }
    }

    private async getAasFromEndpoint(endpoint: URL): Promise<AssetAdministrationShell | null> {
        try {
            return await this.registryService.getAssetAdministrationShellFromEndpoint(endpoint);
        } catch (e) {
            this.log.warn(`Could not find an AAS at the given endpoint at '${endpoint}'`);
            return null;
        }
    }
}
