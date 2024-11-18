import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TransferDto = {
    aas: TransferAas;
    submodels: TransferSubmodel[];
    targetAasRepositoryBaseUrl: string;
    sourceAasRepositoryBaseUrl: string;
    targetSubmodelRepositoryBaseUrl: string;
    sourceSubmodelRepositoryBaseUrl: string;
    targetDiscoveryBaseUrl?: string;
    targetAasRegistryBaseUrl?: string;
    targetSubmodelRegistryBaseUrl?: string;
    apikey?: string;
};

export type TransferSubmodel = {
    originalSubmodelId: string;
    submodel: Submodel;
};

export type TransferAas = {
    originalAasId: string;
    aas: AssetAdministrationShell;
};

export type TransferResult = {
    operationKind:
        | 'AasRepository'
        | 'Discovery'
        | 'AasRegistry'
        | 'SubmodelRepository'
        | 'SubmodelRegistry'
        | 'FileTransfer';
    success: boolean;
    resourceId: string;
    error: string;
};

export type AttachmentDetails = {
    idShortPath: string;
    fileName: string | null;
    file?: Blob;
};
