import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { AttachmentDetails } from 'lib/types/TransferServiceData';
import { ApiFileResponseWrapper, ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export interface IAssetAdministrationShellRepositoryApi {
    /**
     * Returns the base URL of this repository endpoint.
     */
    getBaseUrl(): string;

    /**
     * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getAssetAdministrationShellById(
        aasId: string,
        options?: object,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>>;

    /**
     *
     * @summary Retrieves all Submodel References from the  Asset Administration Shell
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getSubmodelReferencesFromShell(aasId: string, options?: object): Promise<ApiResponseWrapper<Reference[]>>;

    /**
     * @summary Retrieves the thumbnail from the Asset Administration Shell.
     * @param aasId aasId The ID of the Asset Administration Shell.
     * @param options {*} [options] Override http request option.
     * @returns The thumbnail retrieved from the Asset Administration Shell.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getThumbnailFromShell(aasId: string, options?: object): Promise<ApiFileResponseWrapper>;

    /**
     * @summary Uploads a thumbnail to the specified Asset Administration Shell (AAS).
     * @param {string} aasId - The unique identifier of the Asset Administration Shell.
     * @param {Blob} image - The image file to be uploaded as the thumbnail.
     * @param fileName - Name of the image file to be uploaded.
     * @param {object} [options] - Optional. Override HTTP request options.
     * @returns {Promise<ApiResponseWrapper<>Response>} A promise that resolves to the server's response after the thumbnail uploa>d.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    putThumbnailToShell(
        aasId: string,
        image: Blob,
        fileName: string,
        options?: object,
    ): Promise<ApiResponseWrapper<Response>>;

    /**
     * @summary Creates a new Asset Administration Shell (AAS) in the repository.
     * @param {AssetAdministrationShell} aas - The Asset Administration Shell object to be created.
     * @param {object} [options] - Optional. Additional options to override the default HTTP request settings.
     * @returns {Promise<ApiResponseWrapper<>AssetAdministrationShell>} A promise that resolves to the newly created Asset Administration Shel>l.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        options?: object,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>>;
}

export interface ISubmodelRepositoryApi {
    /**
     * Returns the base URL of this repository.
     */
    getBaseUrl(): string;

    /**
     * @summary Retrieves the submodel
     * @param {string} submodelId The Submodels unique id
     * @param {*} [options] Override http request option
     * @throws {RequiredError}
     * @memberof SubmodelRepositoryApi
     */
    getSubmodelById(submodelId: string, options?: object): Promise<ApiResponseWrapper<Submodel>>;

    /**
     * @summary Retrieves the attachment from a submodel element
     * @param submodelId The id of the submodel element is part of
     * @param submodelElementPath The path to the submodel element
     * @param {*} [options] Override http request option
     * @memberof SubmodelRepositoryApi
     */
    getAttachmentFromSubmodelElement(
        submodelId: string,
        submodelElementPath: string,
        options?: object,
    ): Promise<ApiFileResponseWrapper>;

    /**
     * @summary Creates a new submodel in the Submodel repository.
     * @param {Submodel} submodel - The submodel object to be created.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<ApiResponseWrapper<>Submodel>} A promise that resolves to the newly created submodel.
     * @memberof SubmodelRepositoryApi
     */
    postSubmodel(submodel: Submodel, options?: object): Promise<ApiResponseWrapper<Submodel>>;

    /**
     * @summary Uploads an attachment to a specific submodel element.
     * @param {string} submodelId - The unique identifier of the submodel containing the submodel element.
     * @param {AttachmentDetails} attachmentData - The attachment data to be uploaded to the submodel element.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<ApiResponseWrapper<>Response>} A promise that resolves to the server's response after the attachment uploa>d.
     * @memberof SubmodelRepositoryApi
     */
    putAttachmentToSubmodelElement(
        submodelId: string,
        attachmentData: AttachmentDetails,
        options?: object,
    ): Promise<ApiResponseWrapper<Response>>;
}
