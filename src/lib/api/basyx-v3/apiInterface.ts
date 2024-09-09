import { AssetAdministrationShell, Reference } from '@aas-core-works/aas-core3.0-typescript/types';

export interface IAssetAdministrationShellRepositoryApi {
    /**
     * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getAssetAdministrationShellById(aasId: string, options?: object, basePath?: string): Promise<AssetAdministrationShell>;

    /**
     *
     * @summary Retrieves all Submodels from the  Asset Administration Shell
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
}