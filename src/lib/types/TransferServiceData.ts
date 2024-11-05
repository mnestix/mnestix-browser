import { AssetAdministrationShell, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

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
