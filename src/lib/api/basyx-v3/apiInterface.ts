import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';
import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';
import { AttachmentData } from 'lib/types/TransferServiceData';

export interface IAssetAdministrationShellRepositoryApi {
    /**
     * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getAssetAdministrationShellById(
        aasId: string,
        options?: object,
        basePath?: string,
    ): Promise<AssetAdministrationShell>;

    /**
     *
     * @summary Retrieves all Submodel References from the  Asset Administration Shell
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getSubmodelReferencesFromShell(aasId: string, options?: object): Promise<Reference[]>;

    /**
     * @summary Retrieves the thumbnail from the Asset Administration Shell.
     * @param aasId aasId The ID of the Asset Administration Shell.
     * @param options {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @returns The thumbnail retrieved from the Asset Administration Shell.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getThumbnailFromShell(aasId: string, options?: object, basePath?: string): Promise<Blob>;

    /**
     * @summary Uploads a thumbnail to the specified Asset Administration Shell (AAS).
     * @param {string} aasId - The unique identifier of the Asset Administration Shell.
     * @param {Blob} image - The image file to be uploaded as the thumbnail.
     * @param {object} [options] - Optional. Override HTTP request options.
     * @param {string} [basePath] - Optional. The base URL of the repository endpoint.
     * @returns {Promise<Response>} A promise that resolves to the server's response after the thumbnail upload.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    putThumbnailToShell(aasId: string, image: Blob, options?: object, basePath?: string): Promise<Response>;

    /**
     * @summary Creates a new Asset Administration Shell (AAS) in the repository.
     * @param {AssetAdministrationShell} aas - The Asset Administration Shell object to be created.
     * @param {object} [options] - Optional. Additional options to override the default HTTP request settings.
     * @returns {Promise<AssetAdministrationShell>} A promise that resolves to the newly created Asset Administration Shell.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    postAssetAdministrationShell(aas: AssetAdministrationShell, options?: object): Promise<AssetAdministrationShell>;
}

export interface ISubmodelRepositoryApi {
    /**
     * @summary Retrieves the meta data of a submodel
     * @param {string} submodelId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option
     * @throws {RequiredError}
     * @memberof SubmodelRepositoryApi
     */
    getSubmodelMetaDataById(submodelId: string, options?: object): Promise<Submodel>;

    /**
     * @summary Retrieves the submodel
     * @param {string} submodelId The Submodels unique id
     * @param {*} [options] Override http request option
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @throws {RequiredError}
     * @memberof SubmodelRepositoryApi
     */
    getSubmodelById(submodelId: string, options?: object, basePath?: string): Promise<Submodel>;

    /**
     * @summary Retrieves the attachment from a submodel element
     * @param submodelId The id of the submodel the submodel element is part of
     * @param submodelElementPath The path to the submodel element
     * @param {*} [options] Override http request option
     * @memberof SubmodelRepositoryApi
     */
    getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string, options?: object): Promise<Blob>;

    /**
     * @summary Creates a new submodel in the Submodel repository.
     * @param {Submodel} submodel - The submodel object to be created.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<Submodel>} A promise that resolves to the newly created submodel.
     * @memberof SubmodelRepositoryApi
     */
    postSubmodel(submodel: Submodel, options?: object): Promise<Submodel>;

    /**
     * @summary Uploads an attachment to a specific submodel element.
     * @param {string} submodelId - The unique identifier of the submodel containing the submodel element.
     * @param {AttachmentData} attachmentData - The attachment data to be uploaded to the submodel element.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<Response>} A promise that resolves to the server's response after the attachment upload.
     * @memberof SubmodelRepositoryApi
     */
    putAttachmentToSubmodelElement(
        submodelId: string,
        attachmentData: AttachmentData,
        options?: object,
    ): Promise<Response>;
}
