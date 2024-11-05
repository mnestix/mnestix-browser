'use server';

import { TransferService } from 'lib/services/transfer-service/TransferService';
import { TransferDto, TransferResult } from 'lib/types/TransferServiceData';

export async function transferAasWithSubmodels(transferDto: TransferDto): Promise<TransferResult[]> {
    const transfer = TransferService.create(
        transferDto.targetAasRepositoryBaseUrl,
        process.env.AAS_REPO_API_URL ?? '', // TODO this is probably not the correct default URL. Maybe throw here?
        transferDto.targetSubmodelRepositoryBaseUrl,
        process.env.SUBMODEL_REPO_API_URL ?? '', // TODO same here
        transferDto.targetDiscoveryBaseUrl,
        transferDto.targetAasRegistryBaseUrl,
        transferDto.targetSubmodelRegistryBaseUrl,
    );
    return transfer.transferAasWithSubmodels(transferDto);
}
