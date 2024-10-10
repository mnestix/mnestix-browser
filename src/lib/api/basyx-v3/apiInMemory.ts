import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { decodeBase64, encodeBase64 } from 'lib/util/Base64Util';

export interface INullableAasRepositoryEntries {
    repositoryUrl: string;
    aas: AssetAdministrationShell;
}

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    private shellsSavedInTheRepositories: INullableAasRepositoryEntries[] | null | undefined;

    constructor(options: { shellsSavedInTheRepositories: INullableAasRepositoryEntries[] | null }) {
        this.shellsSavedInTheRepositories = options.shellsSavedInTheRepositories;
    }

    postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        options?: object | undefined,
    ): Promise<AssetAdministrationShell> {
        throw new Error('Method not implemented.');
    }

    static getDefaultRepositoryUrl(): string {
        return 'www.aas.default.com/repository';
    }

    getAssetAdministrationShellById(
        aasId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<AssetAdministrationShell> {
        if (!this.shellsSavedInTheRepositories) return Promise.reject('no repository configuration');
        const defaultRepositoryUrl = AssetAdministrationShellRepositoryApiInMemory.getDefaultRepositoryUrl();
        const isSearchingInDefaultRepository = _basePath === defaultRepositoryUrl || _basePath === undefined;
        for (const entry of this.shellsSavedInTheRepositories) {
            if (encodeBase64(entry.aas.id) === aasId) {
                const isInDefaultRepository = entry.repositoryUrl === defaultRepositoryUrl;
                if (isInDefaultRepository || !isSearchingInDefaultRepository) {
                    return Promise.resolve(entry.aas);
                }
            }
        }
        const targetRepositoryKind = isSearchingInDefaultRepository ? 'default' : 'foreign';
        return Promise.reject(
            'no aas found in the ' +
                targetRepositoryKind +
                ' repository for aasId: ' +
                aasId +
                ', which is :' +
                decodeBase64(aasId) +
                ' encoded in base64',
        );
    }

    getSubmodelReferencesFromShell(_aasId: string, _options?: object | undefined): Promise<Reference[]> {
        throw new Error('Method not implemented.');
    }

    getThumbnailFromShell(
        _aasId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}

export class SubmodelRepositoryApiInMemory implements ISubmodelRepositoryApi {
    private submodelsSavedInTheRepository: Submodel[] | null | undefined;

    constructor(options: { submodelsSavedInTheRepository: Submodel[] | null }) {
        this.submodelsSavedInTheRepository = options.submodelsSavedInTheRepository;
    }

    postSubmodel(submodel: Submodel, options?: object | undefined): Promise<Submodel> {
        throw new Error('Method not implemented.');
    }

    getSubmodelMetaDataById(_submodelId: string, _options?: object | undefined): Promise<Submodel> {
        throw new Error('Method not implemented.');
    }

    getSubmodelById(
        submodelId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<Submodel> {
        if (!this.submodelsSavedInTheRepository) return Promise.reject('no repository configuration');
        for (const submodel of this.submodelsSavedInTheRepository) {
            if (encodeBase64(submodel.id) === submodelId) return Promise.resolve(submodel);
        }
        return Promise.reject('no submodel found in the default repository for submodelId: ' + submodelId);
    }

    getAttachmentFromSubmodelElement(
        _submodelId: string,
        _submodelElementPath: string,
        _options?: object | undefined,
    ): Promise<Blob> {
        throw new Error('Method not implemented.');
    }
}
