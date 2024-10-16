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
     */
    getThumbnailFromShell(aasId: string, options?: any, basePath?: string) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getThumbnailFromAssetInformation(
            aasId,
            options,
        )(this.fetch, basePath ?? this.basePath);
    }

    /**
     * @summary Retrieves the thumbnail from the Asset Administration Shell.
     * @param aasId
     * @param image
     * @param options {*} [options] Override http request option.
     * @param {string} [basePath] The URL for the current repository endpoint.
     * @returns The thumbnail retrieved from the Asset Administration Shell.
     */
    putThumbnailToShell(aasId: string, image: Blob, options?: any, basePath?: string) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).putThumbnailToShell(
            aasId,
            image,
            options,
        )(this.fetch, basePath ?? this.basePath);
    }

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

        putThumbnailToShell(
            aasId: string,
            image: Blob,
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
                            .replace(`{fileName}`, 'thumbnail'), //TODO: Get a better file name
                    localVarRequestOptions,
                );
                if (response.status >= 200 && response.status < 300) {
                    return response.json().then(() => {
                        return response;
                    });
                } else {
                    throw response;
                }
            };
        },

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

    postSubmodel(submodel: Submodel, options?: object | undefined): Promise<Submodel> {
        return SubmodelRepositoryApiFp(this.configuration).createSubmodel(submodel, options)(this.fetch, this.basePath);
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
