import { blobToBase64 } from 'lib/util/Base64Util';

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
    if (statusCode > 400 && statusCode < 500) return ApiResultStatus.UNKNOWN_ERROR;
    if (statusCode > 500) return ApiResultStatus.INTERNAL_SERVER_ERROR;
    return ApiResultStatus.SUCCESS;
};

export type ApiResponseWrapper<T> =
    | ApiResponseWrapperSuccess<T>
    | ApiResponseWrapperError<T>
    | ApiResponseWrapperSuccessWithFile<T>;

export type ApiResponseWrapperSuccess<T> = {
    isSuccess: true;
    result: T;
};

export type ApiResponseWrapperSuccessWithFile<T> = {
    isSuccess: true;
    result: T extends Blob ? string : T;
    fileType: string;
};

export type ApiResponseWrapperError<T> = {
    isSuccess: false;
    result?: T;
    errorCode: ApiResultStatus;
    message: string;
};

export function wrapErrorCode<T>(error: ApiResultStatus, message: string): ApiResponseWrapperError<T> {
    return {
        isSuccess: false,
        result: undefined,
        errorCode: error,
        message: message,
    };
}

export async function wrapResponse<T>(response: Response): Promise<ApiResponseWrapper<T>> {
    const status = getStatus(response.status);
    if (status === ApiResultStatus.SUCCESS) {
        return {
            isSuccess: true,
            result: await response.json().catch((e) => console.warn(e.message)),
        };
    } else {
        return {
            isSuccess: false,
            result: await response.json().catch((e) => console.warn(e.message)),
            errorCode: status,
            message: response.statusText,
        };
    }
}

export function wrapSuccess<T>(result: T): ApiResponseWrapper<T> {
    return {
        isSuccess: true,
        result: result,
    };
}

export async function wrapFileResponse<T>(response: Response): Promise<ApiResponseWrapper<T>> {
    const fileFromResponse = await response.blob();
    const status = getStatus(response.status);
    if (status === ApiResultStatus.SUCCESS) {
        return {
            isSuccess: true,
            result: (await blobToBase64(fileFromResponse)) as ApiResponseWrapperSuccessWithFile<T>['result'],
            fileType: fileFromResponse.type,
        };
    } else {
        return {
            isSuccess: false,
            result: await response.json().catch((e) => console.warn(e.message)),
            errorCode: status,
            message: response.statusText,
        };
    }
}
