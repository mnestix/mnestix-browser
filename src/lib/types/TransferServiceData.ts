import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TransferDto = {
    targetAasRepositoryBaseUrl: string;
    targetDiscoveryBaseUrl?: string;
    targetAasRegistryBaseUrl?: string;
    targetSubmodelRepositoryBaseUrl: string;
    targetSubmodelRegistryBaseUrl?: string;
    sourceAasRepositoryBaseUrl?: string | null;
    apikey?: string;
    aas: AssetAdministrationShell;
    originalAasId: string;
    submodels: TransferSubmodel[];
};

export type TransferSubmodel = {
    originalSubmodelId: string;
    submodel: Submodel;
};

export type TransferResult = {
    operationKind:
        | 'AasRepository'
        | 'Discovery'
        | 'AasRegistry'
        | 'SubmodelRepository'
        | 'SubmodelRegistry'
        | 'File transfer';
    success: boolean;
    resourceId: string;
    error: string;
};

export type AttachmentDetails = {
    idShortPath: string;
    fileName: string | null;
    file?: Blob;
};
