import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AttachmentDetails } from 'lib/types/TransferServiceData';

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    constructor(
        private baseUrl: string,
        private shellsInRepositories: AssetAdministrationShell[] = [],
        private reachable: boolean = true,
    ) {}

    getBaseUrl(): string {
        return this.baseUrl;
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
        _options?: object,
    ): Promise<ApiResponseWrapper<Response>> {
        throw new Error('Method not implemented.');
    }

    async getAssetAdministrationShellById(
        aasId: string,
        options?: objec,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        const foundAas = this.shellsInRepositories.find((entry) => encodeBase64(entry.id) === aasId);
        if (foundAas) {
            const response = new Response(JSON.stringify(foundAas));
            return await wrapResponse(response);
        }
        return Promise.resolve(
            wrapErrorCode(
                ApiResultStatus.NOT_FOUND,
                `no aas found in the repository: ${this.baseUrl} for aasId: ${aasId}`,
            ),
        );
    }

    async getSubmodelReferencesFromShell(
        _aasId: string,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<Reference[]>> {
        throw new Error('Method not implemented.');
    }

    async getThumbnailFromShell(_aasId: string, _options?: object): Promise<ApiResponseWrapper<Blob>> {
        throw new Error('Method not implemented.');
    }
}

export class SubmodelRepositoryApiInMemory implements ISubmodelRepositoryApi {
    constructor(
        private baseUrl: string,
        private readonly submodelsInRepository: Submodel[],
    ) {}

    getBaseUrl(): string {
        return this.baseUrl;
    }

    putAttachmentToSubmodelElement(
        _submodelId: string,
        _attachmentData: AttachmentDetails,
        _options?: object,
    ): Promise<ApiResponseWrapper<Response>> {
        throw new Error('Method not implemented.');
    }

    postSubmodel(_submodel: Submodel, _options?: object): Promise<ApiResponseWrapper<Submodel>> {
        throw new Error('Method not implemented.');
    }

    async getSubmodelById(submodelId: string, _options?: object): Promise<ApiResponseWrapper<Submodel>> {
        const foundAas = this.submodelsInRepository.find((entry) => encodeBase64(entry.id) === submodelId);
        if (foundAas) {
            const response = new Response(JSON.stringify(foundAas));
            return await wrapResponse(response);
        }
        return Promise.resolve(
            wrapErrorCode(
                ApiResultStatus.NOT_FOUND,
                `no submodel found in the repository: ${this.baseUrl} for submodelId: ${submodelId}`,
            ),
        );
    }

    async getAttachmentFromSubmodelElement(
        _submodelId: string,
        _submodelElementPath: string,
        _options?: objec,
    ): Promise<ApiResponseWrapper<Blob>> {
        throw new Error('Method not implemented.');
    }
}
