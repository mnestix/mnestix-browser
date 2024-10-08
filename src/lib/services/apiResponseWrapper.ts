export enum ApiResultMapper {
    SUCCESS,
    NOT_FOUND,
    UNAUTHORIZED,
    UNKNOWN_ERROR,
}

const httpStatusMessage: Record<number, ApiResultMapper> = {
    200: ApiResultMapper.SUCCESS,
    401: ApiResultMapper.UNAUTHORIZED,
    404: ApiResultMapper.NOT_FOUND,
};

const getStatus = (statusCode: number): ApiResultMapper => {
    return httpStatusMessage[statusCode] || ApiResultMapper.UNKNOWN_ERROR;
};

export class ApiResponseWrapper<T> {
    errorCode: number;
    message: string;

    constructor(
        public result: T | null,
        httpCode: number,
        message: string,
    ) {
        this.errorCode = getStatus(httpCode);
        this.message = message;
    }

    public isSuccess() {
        return this.errorCode === ApiResultMapper.SUCCESS;
    }

    public isSuccessOrNotFound() {}
}
