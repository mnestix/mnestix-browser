import { AssetAdministrationShellRepositoryApi, SubmodelRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export class TransferService {
    private constructor(
        protected readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly targetSubmodelRepositoryClient: SubmodelRepositoryApi,
    ) {}

    static create(targetAasRepositoryBaseUrl: string, targetSubmodelRepositoryBaseUrl: string): TransferService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: targetAasRepositoryBaseUrl,
            fetch: mnestixFetch(),
        });
        const targetSubmodelRepositoryClient = SubmodelRepositoryApi.create({
            basePath: targetSubmodelRepositoryBaseUrl,
            fetch: mnestixFetch(),
        });
        return new TransferService(targetAasRepositoryClient, targetSubmodelRepositoryClient);
    }

    // TODO Update parameters
    async transferAasWithSubmodels(aas: AssetAdministrationShell | null, submodelRefrences?: Submodel[]) {}
}
