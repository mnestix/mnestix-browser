import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { decodeBase64, encodeBase64 } from 'lib/util/Base64Util';

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    private shellsSavedInTheRepository: AssetAdministrationShell[] | null | undefined;

    constructor(options: { shellsSavedInTheRepository: AssetAdministrationShell[] | null }) {
        this.shellsSavedInTheRepository = options.shellsSavedInTheRepository;
    }

    getAssetAdministrationShellById(
        aasId: string,
        options?: object | undefined,
        basePath?: string | undefined
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
            ' encoded in base64'
        );
    }

    getSubmodelReferencesFromShell(aasId: string, options?: object | undefined): Promise<Reference[]> {
        throw new Error('Method not implemented.');
    }

    getThumbnailFromShell(aasId: string, options?: object | undefined, basePath?: string | undefined): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}