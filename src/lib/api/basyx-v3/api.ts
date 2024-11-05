﻿/* eslint-disable */
import url from 'url';
import { Configuration } from './configuration';
import { AssetAdministrationShell, Reference, Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { encodeBase64 } from 'lib/util/Base64Util';
import { IAssetAdministrationShellRepositoryApi, ISubmodelRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import {
    AssetAdministrationShellRepositoryApiInMemory,
    SubmodelRepositoryApiInMemory
} from 'lib/api/basyx-v3/apiInMemory';
import { ApiResponseWrapper } from 'lib/util/apiResponseWrapper/apiResponseWrapper';
import { AttachmentDetails } from 'lib/types/TransferServiceData';
import { mnestixFetch } from 'lib/api/infrastructure';

export type FetchAPI = {
    fetch: <T>(url: RequestInfo, init?: RequestInit) => Promise<ApiResponseWrapper<T>>;
};

export interface FetchArgs {
    url: string;
    options: any;
}

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
 */
export class AssetAdministrationShellRepositoryApi implements IAssetAdministrationShellRepositoryApi {
    private constructor(
        private basePath: string,
        private http: {
            fetch<T>(url: RequestInfo | URL, init?: RequestInit): Promise<ApiResponseWrapper<T>>;
        },
        private configuration?: Configuration | undefined,
    ) {}

    static create(
        baseUrl: string,
        http: FetchAPI,
        configuration?: Configuration,
    ): AssetAdministrationShellRepositoryApi {
        return new AssetAdministrationShellRepositoryApi(baseUrl, http, configuration);
    }

    static createNull(
        baseUrl: string,
        shellsInRepositories: AssetAdministrationShell[,
    ): AssetAdministrationShellRepositoryApiInMemory {
        return new AssetAdministrationShellRepositoryApiInMemory(baseUrl, shellsInRepositories);
    }

    getBaseUrl(): string {
        return this.basePath;
    }

    async getAssetAdministrationShellById(aasId: string, options?: any) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getAssetAdministrationShellById(
            aasId,
            options,
        )(this.http, this.basePath);
    }

    async getSubmodelReferencesFromShell(aasId: string, options?: any) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getSubmodelReferencesFromShell(
            aasId,
            options,
        )(this.http, this.basePath);
    }

    async getThumbnailFromShell(aasId: string, options?: any) {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).getThumbnailFromAssetInformation(
            aasId,
            options,
        )(this.http, this.basePath);
    }

    async putThumbnailToShell(
        aasId: string,
        image: Blob,
        fileName: string,
        options?: any,
    ): Promise<ApiResponseWrapper<Response>> {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).putThumbnailToShell(
            aasId,
            image,
            fileName,
            options,
        )(mnestixFetch(), this.basePath);
    }

    async postAssetAdministrationShell(
        aas: AssetAdministrationShell,
        options?: object | undefined,
    ): Promise<ApiResponseWrapper<AssetAdministrationShell>> {
        return AssetAdministrationShellRepositoryApiFp(this.configuration).createAssetAdministrationShell(aas, options)(
            this.http,
            this.basePath,
        );
    }
}

/**
 * AssetAdministrationShellRepositoryApi - functional programming interface
 */
export const AssetAdministrationShellRepositoryApiFp = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves a specific Asset Administration Shell from the Asset Administration Shell repository
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getAssetAdministrationShellById(aasId: string, options?: any) {
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getAssetAdministrationShellById(aasId, options);
            return async (requestHandler: FetchAPI, basePath: string) => {
                return requestHandler.fetch<AssetAdministrationShell>(
                    basePath + localVarFetchArgs.url,
                    localVarFetchArgs.options,
                );
            };
        },
        /**
         *
         * @summary Retrieves all SubmodelsReferences from the Asset Administration Shell
         * @param {string} aasId The Asset Administration Shell&#x27;s unique id
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSubmodelReferencesFromShell(aasId: string, options?: any) {
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getSubmodelReferencesFromShell(aasId, options);
            return async (requestHandler: FetchAPI, basePath: string) => {
                return requestHandler.fetch<Reference[]>(basePath + localVarFetchArgs.url, localVarFetchArgs.options);
            };
        },

        /**
         * @summary Retrieves the thumbnail from the Asset Administration Shell.
         * @param aasId aasId The ID of the Asset Administration Shell.
         * @param options {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getThumbnailFromAssetInformation(aasId: string, options?: any) {
            const localVarFetchArgs = AssetAdministrationShellRepositoryApiFetchParamCreator(
                configuration,
            ).getThumbnailFromAssetInformation(aasId, options);
            return async (requestHandler: FetchAPI, basePath: string) => {
                return requestHandler.fetch<Blob>(basePath + localVarFetchArgs.url, localVarFetchArgs.options);
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
        putThumbnailToShell(aasId: string, image: Blob, fileName: string, options?: any) {
            return async (requestHandler: FetchAPI, basePath: string) => {
                const localVarRequestOptions = Object.assign({ method: 'PUT' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                const formData = new FormData();
                formData.append('file', image);

                localVarRequestOptions.body = formData;
                return await requestHandler.fetch<Response>(
                    basePath +
                        `/shells/{aasId}/asset-information/thumbnail?fileName={fileName}`
                            .replace(`{aasId}`, encodeBase64(String(aasId)))
                            .replace(`{fileName}`, fileName),
                    localVarRequestOptions,
                );
            };
        },

        /**
         * @summary Creates a new Asset Administration Shell (AAS) in the repository.
         * @param {AssetAdministrationShell} aas - The Asset Administration Shell object to be created.
         * @param {object} [options] - Optional. Additional options to override the default HTTP request settings.
         * @throws {RequiredError}
         */
        createAssetAdministrationShell(aas: AssetAdministrationShell, options?: any) {
            return async (requestHandler: FetchAPI, basePath: string) => {
                const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                localVarRequestOptions.body = JSON.stringify(aas);

                return await requestHandler.fetch<AssetAdministrationShell>(
                    basePath + '/shells',
                    localVarRequestOptions,
                );
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
 */
export class SubmodelRepositoryApi implements ISubmodelRepositoryApi {
    private constructor(
        private baseUrl: string,
        private http: FetchAPI,
        private configuration?: Configuration
    ) {}

    static create(baseUrl: string, http: FetchAPI, configuration?: Configuration): SubmodelRepositoryApi {
        return new SubmodelRepositoryApi(baseUrl, http, configuration);
    }

    static createNull(basePath: string, submodelsInRepository: Submodel[]): SubmodelRepositoryApiInMemory {
        return new SubmodelRepositoryApiInMemory(basePath, submodelsInRepository);
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    async getSubmodelById(submodelId: string, options?: any): Promise<ApiResponseWrapper<Submodel>> {
        return SubmodelRepositoryApiFp(this.configuration).getSubmodelById(submodelId, options)(
            this.http,
            this.baseUrl
        );
    }

    async getAttachmentFromSubmodelElement(
        submodelId: string,
        submodelElementPath: string,
        options?: any,
    ): Promise<ApiResponseWrapper<Blob>> {
        return SubmodelRepositoryApiFp(this.configuration).getAttachmentFromSubmodelElement(
            submodelId,
            submodelElementPath,
            options,
        )(this.http, this.baseUrl);
    }

    postSubmodel(submodel: Submodel, options?: object): Promise<ApiResponseWrapper<Submodel>> {
        return SubmodelRepositoryApiFp(this.configuration).createSubmodel(submodel, options)(this.http, this.baseUrl);
    }

    putAttachmentToSubmodelElement(
        submodelId: string,
        attachmentDetails: AttachmentDetails,
        options?: any,
    ): Promise<ApiResponseWrapper<Response>> {
        return SubmodelRepositoryApiFp(this.configuration).putAttachmentToSubmodelElement(
            submodelId,
            attachmentDetails,
            options,
        )(this.http, this.baseUrl);
    }
}

/**
 * SubmodelRepositoryApi - functional programming interface
 */
export const SubmodelRepositoryApiFp = function (configuration?: Configuration) {
    return {
        /**
         * @summary Retrieves the submodel
         * @param {string} submodelId The Submodels unique id
         * @param {*} [options] Override http request option
         * @throws {RequiredError}
         */
        getSubmodelById(submodelId: string, options?: any) {
            const localVarFetchArgs = SubmodelRepositoryApiFetchParamCreator(configuration).getSubmodelById(
                encodeBase64(submodelId),
                options,
            );
            return async (requestHandler: FetchAPI, baseUrl: string) => {
                return requestHandler.fetch<Submodel>(baseUrl + localVarFetchArgs.url, localVarFetchArgs.options);
            };
        },
        /**
         * @summary Retrieves the attachment from a submodel element
         * @param submodelId The id of the submodel, the submodel element is part of
         * @param submodelElementPath The path to the submodel element
         * @param {*} [options] Override http request option
         */
        getAttachmentFromSubmodelElement(submodelId: string, submodelElementPath: string, options?: any) {
            const localVarFetchArgs = SubmodelRepositoryApiFetchParamCreator(
                configuration,
            ).getAttachmentFromSubmodelElement(submodelId, submodelElementPath, options);
            return async (requestHandler: FetchAPI, baseUrl: string) => {
                return requestHandler.fetch<Blob>(baseUrl + localVarFetchArgs.url, localVarFetchArgs.options);
            };
        },

        /**
         * @summary Creates a new submodel in the Submodel repository.
         * @param {Submodel} submodel - The submodel object to be created.
         * @param {object} [options] - Optional. Additional options to override default HTTP request settings.
         * @throws {RequiredError}
         */
        createSubmodel(submodel: Submodel, options?: any) {
            return async (requestHandler: FetchAPI, baseUrl: string) => {
                const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                localVarRequestOptions.body = JSON.stringify(submodel);

                return await requestHandler.fetch<Submodel>(baseUrl + '/submodels', localVarRequestOptions);
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
            return async (requestHandler: FetchAPI, baseUrl: string) => {
                const localVarRequestOptions = Object.assign({ method: 'PUT' }, options);
                const localVarHeaderParameter = {
                    Accept: 'application/json',
                } as any;

                localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options?.headers);
                const formData = new FormData();
                formData.append('file', attachmentDetails.file!);

                localVarRequestOptions.body = formData;
                return await requestHandler.fetch<Response>(
                    baseUrl +
                        `/submodels/{submodelIdentifier}/submodel-elements/{idShortPath}/attachment?fileName={fileName}`
                            .replace(`{submodelIdentifier}`, encodeBase64(String(submodelId)))
                            .replace(`{idShortPath}`, attachmentDetails.idShortPath)
                            .replace(`{fileName}`, attachmentDetails.fileName ?? 'Document'),
                    localVarRequestOptions,
                );
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
         * @param submodelId The id of the submodel element is part of
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
