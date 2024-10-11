export const ApiResultStatus = {
    SUCCESS: 'SUCCESS',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ApiResultStatus = typeof ApiResultStatus[keyof typeof ApiResultStatus];

const httpStatusMessage: Record<number, ApiResultStatus> = {
    200: ApiResultStatus.SUCCESS,
    401: ApiResultStatus.UNAUTHORIZED,
    404: ApiResultStatus.NOT_FOUND,
    500: ApiResultStatus.INTERNAL_SERVER_ERROR,
};

const getStatus = (statusCode: number): ApiResultStatus => {
    return statusCode in httpStatusMessage ? httpStatusMessage[statusCode] : ApiResultStatus.UNKNOWN_ERROR;
};

export class ApiResponseWrapper<T> {
    errorCode: ApiResultStatus;
    message: string;

    constructor(public result: T | null, errorCode: ApiResultStatus, message: string) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public isSuccess() {
        return this.errorCode === ApiResultStatus.SUCCESS;
    }

    public castResult<U>(): ApiResponseWrapper<U> {
        return new ApiResponseWrapper(this.result as unknown as U, this.errorCode, this.message);
    }

    public transformResult<U>(transformer: (input: T) => U) {
        if (this.isSuccess()) {
            return new ApiResponseWrapper<U>(transformer(this.result!), this.errorCode, this.message);
        }
        return this.castResult<U>();
    }

    static fromErrorCode<T>(error: ApiResultStatus, message: string) {
        return new ApiResponseWrapper<T>(null, error, message);
    }

    static fromHttpError<T>(error: number, message: string): ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(null, getStatus(error), message);
    }

    static async fromResponse(response: Response): Promise<ApiResponseWrapper<string>> {
        return new ApiResponseWrapper<string>(await response.text(), getStatus(response.status), response.statusText);
    }

    static fromSuccess<T>(result: T): ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(result, ApiResultStatus.SUCCESS, '');
    }

    // Method for converting to JSON (Serializable)
    toJSON() {
        return JSON.parse(JSON.stringify({
            result: this.result,
            errorCode: this.errorCode,
            message: this.message,
        }))
    }

    static fromPlainObject<T>(plainObject: {result: T | null, errorCode: ApiResultStatus, message: string}) : ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(plainObject.result, plainObject.errorCode, plainObject.message);
    }
}
