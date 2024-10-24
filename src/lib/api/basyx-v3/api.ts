/* eslint-disable */
import isomorphicFetch from 'isomorphic-fetch';
import url from 'url';
import { Configuration } from './configuration';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import {
    AssetAdministrationShellRepositoryApiInMemory,
    INullableAasRepositoryEntries,
    SubmodelRepositoryApiInMemory
} from 'lib/api/basyx-v3/apiInMemory';
import { AttachmentDetails } from 'lib/types/TransferServiceData';

const BASE_PATH = '/'.replace(/\/+$/, '');

/**
 *
 * @export
 * @interface FetchAPI
 */
export type FetchAPI = {
    fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
};

/**
 *
 * @export
 * @interface FetchArgs
 */
export interface FetchArgs {
    url: string;
    options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
    protected configuration: Configuration;

    constructor(
        configuration?: Configuration,
        protected basePath: string = BASE_PATH,
        protected fetch: FetchAPI = isomorphicFetch,
    ) {
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
            this.fetch = configuration.fetch || this.fetch;
        }
    }
}

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
    name: 'RequiredError';

    constructor(
        public field: string,
        msg?: string,
    ) {
        super(msg);
    }
}

/**
 * AssetAdministrationShellRepositoryApi - object-oriented interface
 * @class AssetAdministrationShellRepositoryApi
 * @extends {BaseAPI}
 */
export class AssetAdministrationShellRepositoryApi extends BaseAPI implements IAssetAdministrationShellRepositoryApi {
    private constructor(configuration?: Configuration | undefined, basePath?: string, fetch?: FetchAPI) {
        super(configuration, basePath, fetch);
    }

    static create(
        configuration?: Configuration | undefined,
        basePath?: string,
        fetch?: FetchAPI,
    ): AssetAdministrationShellRepositoryApi {
        return new AssetAdministrationShellRepositoryApi(configuration, basePath, fetch);
    }

    static createNull(options: {
        shellsSavedInTheRepositories: INullableAasRepositoryEntries[] | null;
    }): AssetAdministrationShellRepositoryApiInMemory {
        return new AssetAdministrationShellRepositoryApiInMemory(options);
    }

    /**
     * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getAssetAdministrationShellById(aasId: string, options?: any, basePath?: string) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getAssetAdministrationShellById(
            aasId,
            options,
        )(this.fetch, basePath ?? this.basePath);
    }

    /**
     *
     * @summary Retrieves all Submodels from the  Asset Administration Shell
     * @param {string} aasId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getSubmodelReferencesFromShell(aasId: string, options?: any) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getSubmodelReferencesFromShell(
            aasId,
            options,
        )(this.fetch, this.basePath);
    }

    /**
     * @summary Retrieves the thumbnail from the Asset Administration Shell.
     * @param aasId aasId The ID of the Asset Administration Shell.
     * @param options {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @returns The thumbnail retrieved from the Asset Administration Shell.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    getThumbnailFromShell(aasId: string, options?: any, basePath?: string) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getThumbnailFromAssetInformation(
            aasId,
            options,
        )(this.fetch, basePath ?? this.basePath);
    }

    /**
     * @summary Uploads a thumbnail to the specified Asset Administration Shell (AAS).
     * @param {string} aasId - The unique identifier of the Asset Administration Shell.
     * @param {Blob} image - The image file to be uploaded as the thumbnail.
     * @param fileName - Name of the image file to be uploaded.
     * @param {object} [options] - Optional. Override HTTP request options.
     * @param {string} [basePath] - Optional. The base URL of the repository endpoint.
     * @returns {Promise<Response>} A promise that resolves to the server's response after the thumbnail upload.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    putThumbnailToShell(
        aasId: string,
        image: Blob,
        fileName: string,
        options?: any,
        basePath?: string,
    ): Promise<Response> {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).putThumbnailToShell(
            aasId,
            image,
            fileName,
            options,
        )(this.fetch, basePath ?? this.basePath);
    }

    /**
     * @summary Creates a new Asset Administration Shell (AAS) in the repository.
     * @param {AssetAdministrationShell} aas - The Asset Administration Shell object to be created.
     * @param {object} [options] - Optional. Additional options to override the default HTTP request settings.
     * @returns {Promise<AssetAdministrationShell>} A promise that resolves to the newly created Asset Administration Shell.
     * @memberof AssetAdministrationShellRepositoryApi
     */
    postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        options?: object | undefined,
    ): Promise<AssetAdministrationShell> {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).createAssetAdministrationShell(aas, options)(
            this.fetch,
            this.basePath,
        );
    }
}

/**
 * AssetAdministrationShellRepositoryApi - functional programming interface
 * @export
 */
export const AssetAdministrationShellRepositoryApiFp = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getAssetAdministrationShellById(
            aasId: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<AssetAdministrationShell> {
            // HINT: AssetAdministrationShell is taken from aas_core_meta
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getAssetAdministrationShellById(aasId, options);
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            };
        },
        /**
         *
         * @summary Retrieves all SubmodelsReferences from the Asset Administration Shell
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSubmodelReferencesFromShell(
            aasId: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<Reference[]> {
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getSubmodelReferencesFromShell(aasId, options);
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.json().then((resp) => {
                        return resp.result as Reference[];
                    });
                } else {
                    throw response;
                }
            };
        },

        /**
         * @summary Retrieves the thumbnail from the Asset Administration Shell.
         * @param aasId aasId The ID of the Asset Administration Shell.
         * @param options {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getThumbnailFromAssetInformation(
            aasId: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<Blob> {
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getThumbnailFromAssetInformation(aasId, options);
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.blob();
                } else {
                    throw response;
                }
            };
        },

        /**
         * @summary Uploads a thumbnail to the specified Asset Administration Shell (AAS).
         * @param {string} aasId - The unique identifier of the Asset Administration Shell.
         * @param {Blob} image - The image file to be uploaded as the thumbnail.
         * @param fileName - Name of the image file to be uploaded.
         * @param {object} [options] - Optional. Override HTTP request options.
         * @throws {RequiredError}
         */
        putThumbnailToShell(
            aasId: string,
            image: Blob,
            fileName: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<Response> {
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const localVarRequestOptions = Object.assign({ method: 'PUT' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                const formData = new FormData();
                formData.append('file', image);

                localVarRequestOptions.body = formData;
                const response = await requestHandler.fetch(
                    basePath +
                        `/shells/{aasId}/asset-information/thumbnail?fileName={fileName}`
                            .replace(`{aasId}`, encodeBase64(String(aasId)))
                            .replace(`{fileName}`, fileName),
                    localVarRequestOptions,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response;
                } else {
                    throw response;
                }
            };
        },

        /**
         * @summary Creates a new Asset Administration Shell (AAS) in the repository.
         * @param {AssetAdministrationShell} aas - The Asset Administration Shell object to be created.
         * @param {object} [options] - Optional. Additional options to override the default HTTP request settings.
         * @throws {RequiredError}
         */
        createAssetAdministrationShell(
            aas: AssetAdministrationShell,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<AssetAdministrationShell> {
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                localVarRequestOptions.body = JSON.stringify(aas);

                const response = await requestHandler.fetch(basePath + '/shells', localVarRequestOptions);
                if (response.status >= 200 && response.status < 300) {
                    return response.json().then((resp) => {
                        return resp.result as AssetAdministrationShell;
                    });
                } else {
                    throw response;
                }
            };
        },
    };
};

/**
 * AssetAdministrationShellRepositoryApi - fetch parameter creator
 */
export const AssetAdministrationShellRepositoryApiFetchParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getAssetAdministrationShellById(aasId: string, options: any = {}): FetchArgs {
            // verify required parameter 'aasId' is not null or undefined
            if (aasId === null || aasId === undefined) {
                throw new RequiredError(
                    'aasId',
                    'Required parameter aasId was null or undefined when calling getAssetAdministrationShellById.',
                );
            }
            const localVarPath = `/shells/{aasId}`.replace(`{aasId}`, encodeURIComponent(String(aasId)));
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Retrieves all Submodels from the  Asset Administration Shell
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSubmodelReferencesFromShell(aasId: string, options: any = {}): FetchArgs {
            // verify required parameter 'aasId' is not null or undefined
            if (aasId === null || aasId === undefined) {
                throw new RequiredError(
                    'aasId',
                    'Required parameter aasId was null or undefined when calling shellRepoGetSubmodelsFromShell.',
                );
            }
            const localVarPath = `/shells/{aasId}/submodel-refs`.replace(`{aasId}`, encodeURIComponent(String(aasId)));
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },

        /**
         * @summary Retrieves the thumbnail from the Asset Administration Shell.
         * @param aasId aasId The ID of the Asset Administration Shell.
         * @param options {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getThumbnailFromAssetInformation(aasId: string, options: any = {}): FetchArgs {
            // verify required parameter 'aasId' is not null or undefined
            if (aasId === null || aasId === undefined) {
                throw new RequiredError(
                    'aasId',
                    'Required parameter aasId was null or undefined when calling shellRepoGetSubmodelsFromShell.',
                );
            }
            const localVarPath = `/shells/{aasId}/asset-information/thumbnail`.replace(
                `{aasId}`,
                encodeBase64(String(aasId)),
            );
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};

/**
 * SubmodelRepositoryApi - object-oriented interface
 * @class SubmodelRepositoryApi
 * @extends {BaseAPI}
 */
export class SubmodelRepositoryApi extends BaseAPI implements ISubmodelRepositoryApi {
    private constructor(configuration?: Configuration | undefined, basePath?: string, fetch?: FetchAPI) {
        super(configuration, basePath, fetch);
    }

    static create(
        configuration?: Configuration | undefined,
        basePath?: string,
        fetch?: FetchAPI,
    ): SubmodelRepositoryApi {
        return new SubmodelRepositoryApi(configuration, basePath, fetch);
    }

    static createNull(options: { submodelsSavedInTheRepository: Submodel[] | null }): SubmodelRepositoryApiInMemory {
        return new SubmodelRepositoryApiInMemory(options);
    }

    /**
     * @summary Retrieves the meta data of a submodel
     * @param {string} submodelId The Asset Administration Shell&#x27;s unique id
     * @param {*} [options] Override http request option
     * @throws {RequiredError}
     * @memberof SubmodelRepositoryApi
     */
    getSubmodelMetaDataById(submodelId: string, options?: any): Promise<Submodel> {
        return SubmodelRepositoryApiFp(this.configuration).getSubmodelMetaDataById(submodelId, options)(
            this.fetch,
            this.basePath,
        );
    }

    /**
     * @summary Retrieves the submodel
     * @param {string} submodelId The Submodels unique id
     * @param {*} [options] Override http request option
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @throws {RequiredError}
     * @memberof SubmodelRepositoryApi
     */
    getSubmodelById(submodelId: string, options?: any, basePath?: string): Promise<Submodel> {
        return SubmodelRepositoryApiFp(this.configuration).getSubmodelById(submodelId, options)(
            this.fetch,
            basePath ?? this.basePath,
        );
    }

    /**
     * @summary Retrieves the attachment from a submodel element
     * @param submodelId The id of the submodel the submodel element is part of
     * @param submodelElementPath The path to the submodel element
     * @param {*} [options] Override http request option
     * @memberof SubmodelRepositoryApi
     */
    getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string, options?: any): Promise<Blob> {
        return SubmodelRepositoryApiFp(this.configuration).getAttachmentFromSubmodelElement(
            submodelId,
            submodelElementPath,
            options,
        )(this.fetch, this.basePath);
    }

    /**
     * @summary Creates a new submodel in the Submodel repository.
     * @param {Submodel} submodel - The submodel object to be created.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<Submodel>} A promise that resolves to the newly created submodel.
     * @memberof SubmodelRepositoryApi
     */
    postSubmodel(submodel: Submodel, options?: object | undefined): Promise<Submodel> {
        return SubmodelRepositoryApiFp(this.configuration).createSubmodel(submodel, options)(this.fetch, this.basePath);
    }

    /**
     * @summary Uploads an attachment to a specific submodel element.
     * @param {string} submodelId - The unique identifier of the submodel containing the submodel element.
     * @param {AttachmentDetails} attachmentDetails - The attachment data to be uploaded to the submodel element.
     * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
     * @returns {Promise<Response>} A promise that resolves to the server's response after the attachment upload.
     * @memberof SubmodelRepositoryApi
     */
    putAttachmentToSubmodelElement(
        submodelId: string,
        attachmentDetails: AttachmentDetails,
        options?: any,
    ): Promise<Response> {
        return SubmodelRepositoryApiFp(this.configuration).putAttachmentToSubmodelElement(
            submodelId,
            attachmentDetails,
            options,
        )(this.fetch, this.basePath);
    }
}

/**
 * SubmodelRepositoryApi - functional programming interface
 */
export const SubmodelRepositoryApiFp = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves the meta data of a submodel
         * @param {string} submodelId The Submodels unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getSubmodelMetaDataById(
            submodelId: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<Submodel> {
            // HINT: Submodel is taken from aas_core_meta
            const localVarFetchArgs = SubmodelRepositoryApiFetchParamCreator(configuration).getSubmodelMetaDataById(
                encodeBase64(submodelId),
                options,
            );
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            };
        },
        /**
         * @summary Retrieves the submodel
         * @param {string} submodelId The Submodels unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getSubmodelById(submodelId: string, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Submodel> {
            const localVarFetchArgs = SubmodelRepositoryApiFetchParamCreator(configuration).getSubmodelById(
                encodeBase64(submodelId),
                options,
            );
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.json();
                } else {
                    throw response;
                }
            };
        },
        /**
         * @summary Retrieves the attachment from a submodel element
         * @param submodelId The id of the submodel the submodel element is part of
         * @param submodelElementPath The path to the submodel element
         * @param {*} [options] Override http request option
         */
        getAttachmentFromSubmodelElement(
            submodelId: string,
            submodelElementPath: string,
            options?: any,
        ): (fetch?: FetchAPI, basePath?: string) => Promise<Blob> {
            const localVarFetchArgs = SubmodelRepositoryApiFetchParamCreator(
                configuration,
            ).getAttachmentFromSubmodelElement(submodelId, submodelElementPath, options);
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const response = await requestHandler.fetch(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.blob();
                } else {
                    throw response;
                }
            };
        },

        /**
         * @summary Creates a new submodel in the Submodel repository.
         * @param {Submodel} submodel - The submodel object to be created.
         * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
         * @throws {RequiredError}
         */
        createSubmodel(submodel: Submodel, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<Submodel> {
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                localVarRequestOptions.body = JSON.stringify(submodel);

                const response = await requestHandler.fetch(basePath + '/submodels', localVarRequestOptions);
                if (response.status >= 200 && response.status < 300) {
                    return response.json().then((resp) => {
                        return resp.result as Submodel;
                    });
                } else {
                    throw response;
                }
            };
        },

        /**
         * @summary Uploads an attachment to a specific submodel element.
         * @param {string} submodelId - The unique identifier of the submodel containing the submodel element.
         * @param {AttachmentDetails} attachmentDetails - The attachment data to be uploaded to the submodel element.
         * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
         * @throws {RequiredError}
         */
        putAttachmentToSubmodelElement(submodelId: string, attachmentDetails: AttachmentDetails, options: any) {
            return async (requestHandler: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                const localVarRequestOptions = Object.assign({ method: 'PUT' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                const formData = new FormData();
                formData.append('file', attachmentDetails.file!);

                localVarRequestOptions.body = formData;
                const response = await requestHandler.fetch(
                    basePath +
                        `/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment?fileName={fileName}`
                            .replace(`{submodelIdentifier}`, encodeBase64(String(submodelId)))
                            .replace(`{idShortPath}`, attachmentDetails.idShortPath)
                            .replace(`{fileName}`, attachmentDetails.fileName ?? 'Document'),
                    localVarRequestOptions,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response;
                } else {
                    throw response;
                }
            };
        },
    };
};

/**
 * SubmodelRepositoryApi - fetch parameter creator
 */
export const SubmodelRepositoryApiFetchParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves the meta data of a submodel
         * @param {string} submodelId The Submodels unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getSubmodelMetaDataById(submodelId: string, options: any = {}): FetchArgs {
            // verify required parameter 'submodelId' is not null or undefined
            if (submodelId === null || submodelId === undefined) {
                throw new RequiredError(
                    'submodelId',
                    'Required parameter submodelId was null or undefined when calling getSubmodelMetaDataById.',
                );
            }
            const localVarPath = `/submodels/{submodelId}/$metadata?level=core`.replace(
                `{submodelId}`,
                encodeURIComponent(String(submodelId)),
            );
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * @summary Retrieves the submodel
         * @param {string} submodelId The Submodels unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getSubmodelById(submodelId: string, options: any = {}): FetchArgs {
            // verify required parameter 'submodelId' is not null or undefined
            if (submodelId === null || submodelId === undefined) {
                throw new RequiredError(
                    'submodelId',
                    'Required parameter submodelId was null or undefined when calling getSubmodelById.',
                );
            }
            const localVarPath = `/submodels/{submodelId}`.replace(
                `{submodelId}`,
                encodeURIComponent(String(submodelId)),
            );
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * @summary Retrieves the attachment from a submodel element
         * @param submodelId The id of the submodel the submodel element is part of
         * @param submodelElementPath The path to the submodel element
         * @param {*} [options] Override http request option
         */
        getAttachmentFromSubmodelElement(
            submodelId: string,
            submodelElementPath: string,
            options: any = {},
        ): FetchArgs {
            // verify required parameter 'submodelId' is not null or undefined
            if (submodelId === null || submodelId === undefined) {
                throw new RequiredError(
                    'submodelId',
                    'Required parameter submodelId was null or undefined when calling getSubmodelById.',
                );
            }
            const localVarPath = `/submodels/{submodelId}/submodel-elements/{submodelElementPath}/attachment`
                .replace(`{submodelId}`, encodeURIComponent(String(encodeBase64(submodelId))))
                .replace(`{submodelElementPath}`, submodelElementPath);
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'GET' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};
