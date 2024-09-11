import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { decodeBase64, encodeBase64 } from 'lib/util/Base64Util';

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    private shellsSavedInTheRepository: AssetAdministrationShell[] | null | undefined;

    constructor(options: { shellsSavedInTheRepository: AssetAdministrationShell[] | null }) {
        this.shellsSavedInTheRepository = options.shellsSavedInTheRepository;
    }

    getAssetAdministrationShellById(
        aasId: string,
        options?: object | undefined,
        basePath?: string | undefined,
    ): Promise<AssetAdministrationShell> {
        if (!this.shellsSavedInTheRepository) return Promise.reject('no repository configuration');
        for (const aas of this.shellsSavedInTheRepository) {
            if (encodeBase64(aas.id) === aasId) return Promise.resolve(aas);
        }
        return Promise.reject(
            'no aas found in the default repository for aasId: ' +
                aasId +
                ', which is :' +
                decodeBase64(aasId) +
                ' encoded in base64',
        );
    }

    getSubmodelReferencesFromShell(aasId: string, options?: object | undefined): Promise<Reference[]> {
        throw new Error('Method not implemented.');
    }

    getThumbnailFromShell(aasId: string, options?: object | undefined, basePath?: string | undefined): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}

export class SubmodelRepositoryApiInMemory implements ISubmodelRepositoryApi {
    private submodelsSavedInTheRepository: Submodel[] | null | undefined;

    constructor(options: { submodelsSavedInTheRepository: Submodel[] | null }) {
        this.submodelsSavedInTheRepository = options.submodelsSavedInTheRepository;
    }

    getSubmodelMetaDataById(submodelId: string, options?: object | undefined): Promise<Submodel> {
        throw new Error('Method not implemented.');
    }

    getSubmodelById(
        submodelId: string,
        options?: object | undefined,
        basePath?: string | undefined,
    ): Promise<Submodel> {
        if (!this.submodelsSavedInTheRepository) return Promise.reject('no repository configuration');
        for (const submodel of this.submodelsSavedInTheRepository) {
            if (encodeBase64(submodel.id) === submodelId) return Promise.resolve(submodel);
        }
        return Promise.reject('no submodel found in the default repository for submodelId: ' + submodelId);
    }

    getAttachmentFromSubmodelElement(
        submodelId: string,
        submodelElementPath: string,
        options?: object | undefined,
    ): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}
