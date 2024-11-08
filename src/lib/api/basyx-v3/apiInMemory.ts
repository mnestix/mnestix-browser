import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { decodeBase64, encodeBase64 } from 'lib/util/Base64Util';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AttachmentDetails } from 'lib/types/TransferServiceData';

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
        _aas: AssetAdministrationShell,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        throw new Error('Method not implemented.');
    }

    putThumbnailToShell(
        _aasId: string,
        _image: Blob,
        _fileName: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<ApiResponseWrapper<Response>> {
        throw new Error('Method not implemented.');
    }

    static getDefaultRepositoryUrl(): string {
        return 'www.aas.default.com/repository';
    }

    async getAssetAdministrationShellById(
        aasId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (!this.shellsSavedInTheRepositories) return Promise.reject('no repository configuration');
        const defaultRepositoryUrl = AssetAdministrationShellRepositoryApiInMemory.getDefaultRepositoryUrl();
        const isSearchingInDefaultRepository = _basePath === defaultRepositoryUrl || _basePath === undefined;
        for (const entry of this.shellsSavedInTheRepositories) {
            if (encodeBase64(entry.aas.id) === aasId) {
                const isInDefaultRepository = entry.repositoryUrl === defaultRepositoryUrl;
                if (isInDefaultRepository || !isSearchingInDefaultRepository) {
                    const response = new Response(JSON.stringify(entry.aas));
                    return await wrapResponse<AssetAdministrationShell>(response);
                }
            }
        }
        const targetRepositoryKind = isSearchingInDefaultRepository ? 'default' : 'foreign';
        return Promise.resolve(
            wrapErrorCode(
                ApiResultStatus.NOT_FOUND,
                'no aas found in the ' +
                    targetRepositoryKind +
                    ' repository for aasId: ' +
                    aasId +
                    ', which is :' +
                    decodeBase64(aasId) +
                    ' encoded in base64',
            ),
        );
    }

    async getSubmodelReferencesFromShell(
        _aasId: string,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<Reference[]>> {
        throw new Error('Method not implemented.');
    }

    async getThumbnailFromShell(
        _aasId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<ApiResponseWrapper<Blob>> {
        throw new Error('Method not implemented.');
    }
}

export class SubmodelRepositoryApiInMemory implements ISubmodelRepositoryApi {
    private submodelsSavedInTheRepository: Submodel[] | null | undefined;

    constructor(options: { submodelsSavedInTheRepository: Submodel[] | null }) {
        this.submodelsSavedInTheRepository = options.submodelsSavedInTheRepository;
    }

    putAttachmentToSubmodelElement(
        _submodelId: string,
        _attachmentData: AttachmentDetails,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<Response>> {
        throw new Error('Method not implemented.');
    }

    postSubmodel(_submodel: Submodel, _options?: object | undefined): Promise<ApiResponseWrapper<Submodel>> {
        throw new Error('Method not implemented.');
    }

    async getSubmodelById(
        submodelId: string,
        _options?: object | undefined,
        _basePath?: string | undefined,
    ): Promise<ApiResponseWrapper<Submodel>> {
        if (!this.submodelsSavedInTheRepository) return Promise.reject('no repository configuration');
        for (const submodel of this.submodelsSavedInTheRepository) {
            if (encodeBase64(submodel.id) === submodelId) {
                const response = new Response(JSON.stringify(submodel));
                return await wrapResponse<Submodel>(response);
            }
        }
        return Promise.resolve(
            wrapErrorCode(
                ApiResultStatus.NOT_FOUND,
                'no submodel found in the default repository for submodelId: ' + submodelId,
            ),
        );
    }

    async getAttachmentFromSubmodelElement(
        _submodelId: string,
        _submodelElementPath: string,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<Blob>> {
        throw new Error('Method not implemented.');
    }
}
