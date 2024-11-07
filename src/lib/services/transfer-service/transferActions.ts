'use server';

import { TransferService } from 'lib/services/transfer-service/TransferService';
import { TransferDto, TransferResult } from 'lib/types/TransferServiceData';

export async function transferAasWithSubmodels(transferDto: TransferDto): Promise<TransferResult[]> {
    const transfer = TransferService.create(
        transferDto.targetAasRepositoryBaseUrl,
        transferDto.targetSubmodelRepositoryBaseUrl,
        transferDto.targetDiscoveryBaseUrl,
        transferDto.targetAasRegistryBaseUrl,
        transferDto.targetSubmodelRegistryBaseUrl,
        transferDto.sourceAasRepositoryBaseUrl,
    );
    return transfer.transferAasWithSubmodels(transferDto);
}
