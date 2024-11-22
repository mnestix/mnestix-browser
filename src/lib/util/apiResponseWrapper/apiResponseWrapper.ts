import { base64ToBlob, blobToBase64 } from 'lib/util/Base64Util';

export const ApiResultStatus = {
    SUCCESS: 'SUCCESS',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ApiResultStatus = (typeof ApiResultStatus)[keyof typeof ApiResultStatus];

const httpStatusMessage: Record<number, ApiResultStatus> = {
    200: ApiResultStatus.SUCCESS,
    401: ApiResultStatus.UNAUTHORIZED,
    404: ApiResultStatus.NOT_FOUND,
    500: ApiResultStatus.INTERNAL_SERVER_ERROR,
};

const getStatus = (statusCode: number): ApiResultStatus => {
    if (statusCode in httpStatusMessage) return httpStatusMessage[statusCode];
    if (statusCode >= 400 && statusCode < 500) return ApiResultStatus.UNKNOWN_ERROR;
    if (statusCode >= 500) return ApiResultStatus.INTERNAL_SERVER_ERROR;
    return ApiResultStatus.SUCCESS;
};

export type ApiResponseWrapper<T> =
    | ApiResponseWrapperSuccess<T>
    | ApiResponseWrapperError<T>;

export type ApiFileResponseWrapper =
    | ApiResponseWrapperSuccessWithFile
    | ApiResponseWrapperError<Blob>;

export type ApiResponseWrapperSuccess<T> = {
    isSuccess: true;
    result: T;
};

export type ApiResponseWrapperSuccessWithFile = {
    isSuccess: true;
    fileContent: string;
    fileType: string;
};

export type ApiResponseWrapperError<T> = {
    isSuccess: false;
    result?: T;
    errorCode: ApiResultStatus;
    message: string;
};

export function wrapSuccess<T>(result: T): ApiResponseWrapperSuccess<T> {
    return {
        isSuccess: true,
        result: result,
    };
}

export function wrapErrorCode<T>(error: ApiResultStatus, message: string, result?: T): ApiResponseWrapperError<T> {
    return {
        isSuccess: false,
        result: result,
        errorCode: error,
        message: message,
    };
}

export async function wrapFile(content: Blob): Promise<ApiResponseWrapperSuccessWithFile> {
    return {
        isSuccess: true,
        fileContent: await blobToBase64(content),
        fileType: content.type,
    };
}

export async function wrapResponse<T>(response: Response): Promise<ApiResponseWrapper<T>> {
    const status = getStatus(response.status);
    const result = await response.json().catch((e) => console.warn(e.message));
    
    if (status !== ApiResultStatus.SUCCESS) {
        return wrapErrorCode(status, response.statusText, result);
    }
    
    return wrapSuccess(result);
}

export async function wrapFileResponse(response: Response): Promise<ApiFileResponseWrapper> {
    const status = getStatus(response.status);
    if (status !== ApiResultStatus.SUCCESS) {
        return wrapErrorCode<Blob>(status, response.statusText, undefined);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!(contentType && !contentType.includes('application/json'))) {
        const errorMsg = `The response was expected to be of type 'application/json' but was of type '${contentType}'.`;
        return wrapErrorCode<Blob>(ApiResultStatus.UNKNOWN_ERROR, errorMsg)
    }

    const fileFromResponse = await response.blob();
    return await wrapFile(fileFromResponse);
}

export function getFileFromResponse(fileResponse: ApiResponseWrapperSuccessWithFile): Blob {
    return base64ToBlob(fileResponse.fileContent, fileResponse.fileType)
}