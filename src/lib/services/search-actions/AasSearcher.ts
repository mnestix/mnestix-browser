import { AssetAdministrationShellDescriptor, Endpoint, SubmodelDescriptor } from 'lib/types/registryServiceTypes';
import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Log } from 'lib/util/Log';
import { IDiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApiInterface';
import { IRegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApiInterface';
import { RegistryServiceApi } from 'lib/api/registry-service-api/registryServiceApi';
import { DiscoveryServiceApi } from 'lib/api/discovery-service-api/discoveryServiceApi';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    NullableMultipleDataSourceSetupParameters,
    RepoSearchResult,
    RepositorySearchService,
} from 'lib/services/repository-access/RepositorySearchService';
import { INullableAasRepositoryEntries } from 'lib/api/basyx-v3/apiInMemory';
import { mnestixFetch } from 'lib/api/infrastructure';
import { ApiResponseWrapper, ApiResultStatus, wrapErrorCode, wrapSuccess } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

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
        protected readonly multipleDataSource: RepositorySearchService,
        protected readonly log: Log,
    ) {}

    static create(): AasSearcher {
        const multipleDataSource = RepositorySearchService.create();
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
            RepositorySearchService.createNull({
                shellsSavedInTheRepositories: shellsSavedInTheRepositories,
                submodelsSavedInTheRepository,
            }),
            log ?? Log.createNull(),
        );
    }

    async performFullSearch(searchInput: string): Promise<ApiResponseWrapper<AasSearchResult>> {
        const aasIds = await this.performAasDiscoverySearch(searchInput);
        const foundMultipleDiscoveryResults = aasIds.isSuccess && aasIds.result.length > 1;
        const foundOneDiscoveryResult = aasIds.isSuccess && aasIds.result.length === 1;

        if (foundMultipleDiscoveryResults) {
            return wrapSuccess(this.createDiscoveryRedirectResult(searchInput));
        }

        const aasId = foundOneDiscoveryResult ? aasIds.result[0] : searchInput;
        const aasIdEncoded = encodeBase64(aasId);

        const aasRegistryResult = await this.performRegistrySearch(aasId);
        if (aasRegistryResult.isSuccess) {
            return wrapSuccess(aasRegistryResult.result);
        }

        const defaultResult = await this.getAasFromDefaultRepository(aasIdEncoded);
        if (defaultResult.isSuccess) {
            return wrapSuccess(this.createAasResult(defaultResult.result));
        }

        const potentiallyMultipleAas = await this.getAasFromAllRepositories(aasIdEncoded);
        if (potentiallyMultipleAas.isSuccess) {
            if (potentiallyMultipleAas.result!.length === 1) {
                return wrapSuccess(this.createAasResult(potentiallyMultipleAas.result[0].aas));
            }
            if (potentiallyMultipleAas.result!.length > 1) {
                return wrapSuccess(this.createDiscoveryRedirectResult(searchInput));
            }
        }
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, 'No AAS found for the given ID');
    }

    // TODO: handle multiple endpoints as result
    public async performRegistrySearch(searchAasId: string): Promise<ApiResponseWrapper<AasSearchResult>> {
        const registrySearchResult = await this.performAasRegistrySearch(searchAasId);
        if (!registrySearchResult.isSuccess) {
            return wrapErrorCode(registrySearchResult.errorCode, registrySearchResult.message);
        }
        const endpoint = registrySearchResult.result.endpoints[0];

        const aasSearchResult = await this.getAasFromEndpoint(endpoint);
        if (!aasSearchResult.isSuccess) {
            return wrapErrorCode(aasSearchResult.errorCode, aasSearchResult.message);
        }
        const data = {
            submodelDescriptors: registrySearchResult.result.submodelDescriptors,
            aasRegistryRepositoryOrigin: endpoint.origin,
        };
        return wrapSuccess(this.createAasResult(aasSearchResult.result, data));
    }

    public async performAasDiscoverySearch(searchAssetId: string): Promise<ApiResponseWrapper<string[]>> {
        const response = await this.discoveryServiceClient.getAasIdsByAssetId(searchAssetId);
        if (response.isSuccess) return wrapSuccess(response.result.result);
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `Could not find the asset '${searchAssetId}' in the discovery service`,
        );
    }

    public async getAasFromRepository(
        aasId: string,
        repoUrl: string,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const response = await this.multipleDataSource.getAasFromRepo(aasId, repoUrl);
        if (response.isSuccess) return response;
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `Could not find an AAS '${aasId}' in the repository '${repoUrl}'`,
        );
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

    private async performAasRegistrySearch(searchAasId: string): Promise<ApiResponseWrapper<RegistrySearchResult>> {
        const shellDescription = await this.registryService.getAssetAdministrationShellDescriptorById(searchAasId);
        if (!shellDescription.isSuccess) {
            return wrapErrorCode(
                ApiResultStatus.NOT_FOUND,
                `Could not find the AAS '${searchAasId}' in the registry service`,
            );
        }
        const endpoints = shellDescription.result.endpoints as Endpoint[];
        const submodelDescriptors = shellDescription.result.submodelDescriptors as SubmodelDescriptor[];
        const endpointUrls = endpoints.map((endpoint) => new URL(endpoint.protocolInformation.href));
        return wrapSuccess<RegistrySearchResult>({
            endpoints: endpointUrls,
            submodelDescriptors: submodelDescriptors,
        });
    }

    private async getAasFromEndpoint(endpoint: URL): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        return await this.registryService.getAssetAdministrationShellFromEndpoint(endpoint);
    }

    private async getAasFromDefaultRepository(aasId: string): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const response = await this.multipleDataSource.getAasFromDefaultRepository(aasId);
        if (response.isSuccess) return response;
        const message = `Could not find the AAS '${aasId}' in the default repository`;
        this.log.warn(message);
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, message);
    }

    private async getAasFromAllRepositories(aasId: string): Promise<ApiResponseWrapper<RepoSearchResult[]>> {
        const response = await this.multipleDataSource.getAasFromAllRepos(aasId);
        if (response.isSuccess) return response;
        const message = `Could not find the AAS '${aasId}' in any configured repository`;
        this.log.warn(message);
        return wrapErrorCode(ApiResultStatus.NOT_FOUND, message);
    }
}