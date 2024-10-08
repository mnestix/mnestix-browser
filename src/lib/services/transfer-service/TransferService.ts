import { AssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';
import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';

export type TransferData = {
    sourceRepositoryBaseUrl: string;
    targetRepositoryBaseUrl: string;
    aas: AssetAdministrationShell | null;
    submodelRefrences?: Reference[];
};

export class TransferService {
    private constructor(
        protected readonly sourceRepositoryClient: IAssetAdministrationShellRepositoryApi,
        protected readonly targetRepositoryClient: IAssetAdministrationShellRepositoryApi,
    ) {}

    static create(sourceRepositoryUrl: string, targetRepositoryUrl: string): TransferService {
        const sourceRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: sourceRepositoryUrl,
            fetch: mnestixFetch(),
        });
        const targetRepositoryClient = AssetAdministrationShellRepositoryApi.create({
            basePath: targetRepositoryUrl,
            fetch: mnestixFetch(),
        });
        return new TransferService(sourceRepositoryClient, targetRepositoryClient);
    }

    async transferAasWithSubmodels(aas: AssetAdministrationShell, submodelRefrences?: Reference[]) {
        console.log(aas);
        console.log(submodelRefrences);
    }
}
