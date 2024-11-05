import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AttachmentDetails } from 'lib/types/TransferServiceData';
import { ServiceReachable } from 'lib/services/transfer-service/TransferService';

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    constructor(
        private baseUrl: string,
        private shellsInRepositories: AssetAdministrationShell[] = [],
        private reachable: ServiceReachable = ServiceReachable.Yes,
    ) {}

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        if (this.shellsInRepositories.find((entry) => encodeBase64(entry.id) === aas.id))
            return wrapErrorCode(
                ApiResultStatus.INTERNAL_SERVER_ERROR,
                `AAS repository already has an AAS with id '${aas.id}`,
            );
        this.shellsInRepositories.push(aas);
        return wrapSuccess(aas);
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
        _options?: object,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
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
        private reachable: ServiceReachable = ServiceReachable.Yes,
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
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service no;t reachable');
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
        _options?: object,
    ): Promise<ApiResponseWrapper<Blob>> {
        throw new Error('Method not implemented.');
    }
}
