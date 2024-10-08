import { TransferData, TransferService } from 'lib/services/transfer-service/TransferService';

export async function transferAasWithSubmodels(transferData: TransferData): Promise<void> {
    const transfer = TransferService.create(transferData.targetRepositoryBaseUrl, transferData.targetRepositoryBaseUrl);
    return transfer.transferAasWithSubmodels(transferData.aas, transferData.submodelRefrences);
}
