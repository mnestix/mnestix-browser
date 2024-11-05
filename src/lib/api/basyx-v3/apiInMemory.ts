import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import {
    ApiResponseWrapper,
    ApiResultStatus,
    wrapErrorCode,
    wrapResponse,
    wrapSuccess,
} from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AttachmentDetails } from 'lib/types/TransferServiceData';
import { ServiceReachable } from 'lib/services/transfer-service/TransferService';
import { encodeBase64 } from 'lib/util/Base64Util';

export class AssetAdministrationShellRepositoryApiInMemory implements IAssetAdministrationShellRepositoryApi {
    readonly shellsInRepositories: Map<string, AssetAdministrationShell>;

    constructor(
        readonly baseUrl: string,
        shellsInRepositories: AssetAdministrationShell[] = [],
        readonly reachable: ServiceReachable = ServiceReachable.Yes,
    ) {
        this.shellsInRepositories = new Map<string, AssetAdministrationShell>();
        shellsInRepositories.forEach((value) => this.shellsInRepositories.set(encodeBase64(value.id), value));
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        _options?: object | undefined,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        if (this.shellsInRepositories.get(aas.id))
            return wrapErrorCode(
                ApiResultStatus.INTERNAL_SERVER_ERROR,
                `AAS repository already has an AAS with id '${aas.id}`,
            );
        this.shellsInRepositories.set(aas.id, aas);
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
        const foundAas = this.shellsInRepositories.get(aasId);
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
    readonly submodelsInRepository: Map<string, Submodel>;

    constructor(
        readonly baseUrl: string,
        submodelsInRepository: Submodel[],
        readonly reachable: ServiceReachable = ServiceReachable.Yes,
    ) {
        this.submodelsInRepository = new Map<string, Submodel>();
        submodelsInRepository.forEach((submodel) => {
            this.submodelsInRepository.set(submodel.id, submodel);
        });
    }

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

    async postSubmodel(submodel: Submodel, _options?: object): Promise<ApiResponseWrapper<Submodel>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        if (this.submodelsInRepository.has(submodel.id))
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, `Submodel repository '${this.getBaseUrl()}' already has a submodel '${submodel.id}'`);
        this.submodelsInRepository.set(submodel.id, submodel);
        return wrapSuccess(submodel);
    }

    async getSubmodelById(submodelId: string, _options?: object): Promise<ApiResponseWrapper<Submodel>> {
        if (this.reachable !== ServiceReachable.Yes)
            return wrapErrorCode(ApiResultStatus.UNKNOWN_ERROR, 'Service not reachable');
        const foundAas = this.submodelsInRepository.get(submodelId);
        if (foundAas) {
            const response = new Response(JSON.stringify(foundAas));
            return wrapResponse(response);
        }
        return wrapErrorCode(
            ApiResultStatus.NOT_FOUND,
            `no submodel found in the repository: '${this.baseUrl}' for submodel: '${submodelId}'`,
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
