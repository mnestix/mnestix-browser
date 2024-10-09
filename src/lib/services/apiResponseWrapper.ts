export enum ApiResultMapper {
    SUCCESS,
    NOT_FOUND,
    UNAUTHORIZED,
    UNKNOWN_ERROR,
    INTERNAL_SERVER_ERROR,
}

const httpStatusMessage: Record<number, ApiResultMapper> = {
    200: ApiResultMapper.SUCCESS,
    401: ApiResultMapper.UNAUTHORIZED,
    404: ApiResultMapper.NOT_FOUND,
    500: ApiResultMapper.INTERNAL_SERVER_ERROR,
};

const getStatus = (statusCode: number): ApiResultMapper => {
    return (statusCode in httpStatusMessage) ? httpStatusMessage[statusCode] : ApiResultMapper.UNKNOWN_ERROR;
};

export class ApiResponseWrapper<T> {
    errorCode: ApiResultMapper;
    message: string;

    constructor(
        public result: T | null,
        errorCode: ApiResultMapper,
        message: string,
    ) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public isSuccess() {
        return this.errorCode === ApiResultMapper.SUCCESS;
    }

    public castResult<T>() : ApiResponseWrapper<T> {
        return new ApiResponseWrapper(this.result as T, this.errorCode, this.message)
    }

    public transformResult<G>(transformer: (input: T) => G){
        if (this.result !== null) {
            return new ApiResponseWrapper<G>(transformer(this.result as T), this.errorCode, this.message)
        }
        return this.castResult<G>();
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
        return new ApiResponseWrapper<T>(result, ApiResultMapper.SUCCESS, '')
    }
}

