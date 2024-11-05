import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export type TransferDto = {
    aas: AssetAdministrationShell;
    submodels: Submodel[];
    targetAasRepositoryBaseUrl: string;
    sourceAasRepositoryBaseUrl?: string; // TODO change this to mandatory
    targetSubmodelRepositoryBaseUrl: string;
    sourceSubmodelRepositoryBaseUrl?: string; // TODO change this to mandatory
    targetDiscoveryBaseUrl?: string;
    targetAasRegistryBaseUrl?: string;
    targetSubmodelRegistryBaseUrl?: string;
    apikey?: string;
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
    // status: 'Success' | 'Failed' | 'Ignored' | 'Skipped';
    resourceId: string;
    error: string;
};

export type AttachmentDetails = {
    idShortPath: string;
    fileName: string | null;
    file?: Blob;
};
