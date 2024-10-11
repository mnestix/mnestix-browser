'use server';

import { TransferService } from 'lib/services/transfer-service/TransferService';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TransferDto = {
    targetAasRepositoryBaseUrl: string;
    targetDiscoveryBaseUrl?: string;
    targetAasRegistryBaseUrl?: string;
    targetSubmodelRepositoryBaseUrl: string;
    targetSubmodelRegistryBaseUrl?: string;
    apikey?: string;
    aas: AssetAdministrationShell;
    submodels: Submodel[];
};

export async function transferAasWithSubmodels(transferDto: TransferDto): Promise<TransferResult[]> {
    const transfer = TransferService.create(
        transferDto.targetAasRepositoryBaseUrl,
        transferDto.targetSubmodelRepositoryBaseUrl,
        transferDto.targetDiscoveryBaseUrl,
        transferDto.targetAasRegistryBaseUrl,
        transferDto.targetSubmodelRegistryBaseUrl,
    );
    return transfer.transferAasWithSubmodels(transferDto);
}
