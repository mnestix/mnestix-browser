export const ApiResultMapper = {
    SUCCESS: 'SUCCESS',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ApiResultMapper = typeof ApiResultMapper[keyof typeof ApiResultMapper];

const httpStatusMessage: Record<number, ApiResultMapper> = {
    200: ApiResultMapper.SUCCESS,
    401: ApiResultMapper.UNAUTHORIZED,
    404: ApiResultMapper.NOT_FOUND,
    500: ApiResultMapper.INTERNAL_SERVER_ERROR,
};

const getStatus = (statusCode: number): ApiResultMapper => {
    return statusCode in httpStatusMessage ? httpStatusMessage[statusCode] : ApiResultMapper.UNKNOWN_ERROR;
};

export class ApiResponseWrapper<T> {
    errorCode: ApiResultMapper;
    message: string;

    constructor(public result: T | null, errorCode: ApiResultMapper, message: string) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public isSuccess() {
        return this.errorCode === ApiResultMapper.SUCCESS;
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

    static fromErrorCode<T>(error: ApiResultMapper, message: string) {
        return new ApiResponseWrapper<T>(null, error, message);
    }

    static fromHttpError<T>(error: number, message: string): ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(null, getStatus(error), message);
    }

    static async fromResponse(response: Response): Promise<ApiResponseWrapper<string>> {
        return new ApiResponseWrapper<string>(await response.text(), getStatus(response.status), response.statusText);
    }

    static fromSuccess<T>(result: T): ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(result, ApiResultMapper.SUCCESS, '');
    }

    // Method for converting to JSON (Serializable)
    toJSON() {
        return JSON.parse(JSON.stringify({
            result: this.result,
            errorCode: this.errorCode,
            message: this.message,
        }))
    }

    static fromPlainObject<T>(plainObject: {result: T | null, errorCode: ApiResultMapper, message: string}) : ApiResponseWrapper<T> {
        return new ApiResponseWrapper<T>(plainObject.result, plainObject.errorCode, plainObject.message);
    }
}
