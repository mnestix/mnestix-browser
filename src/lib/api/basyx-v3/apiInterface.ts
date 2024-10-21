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
     */
    getThumbnailFromShell(aasId: string, options?: object, basePath?: string): Promise<Blob>;

    putThumbnailToShell(aasId: string, image: Blob, options?: object, basePath?: string): Promise<Response>;

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

    postSubmodel(submodel: Submodel, options?: object): Promise<Submodel>;

    putAttachmentToSubmodelElement(
        submodelId: string,
        attachmentData: AttachmentData,
        options?: object,
    ): Promise<Response>;
}
