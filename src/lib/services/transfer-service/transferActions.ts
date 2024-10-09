import { TransferService } from 'lib/services/transfer-service/TransferService';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TransferDto = {
    targetAasRepositoryBaseUrl: string;
    targetSubmodelRepositoryBaseUrl: string;
    aas: AssetAdministrationShell;
    submodels: Submodel[];
};

export async function transferAasWithSubmodels(transferDto: TransferDto): Promise<void> {
    const transfer = TransferService.create(
        transferDto.targetAasRepositoryBaseUrl,
        transferDto.targetSubmodelRepositoryBaseUrl,
    );
    return transfer.transferAasWithSubmodels(transferDto.aas, transferDto.submodels);
}
