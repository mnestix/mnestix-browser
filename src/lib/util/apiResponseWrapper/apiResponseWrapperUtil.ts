import { ApiResponseWrapper, ApiResponseWrapperSuccessWithFile } from 'lib/util/apiResponseWrapper/apiResponseWrapper';

export function isSuccessWithFile<T>(
    response: ApiResponseWrapper<T>,
): response is ApiResponseWrapperSuccessWithFile<T> {
    return response.isSuccess && 'fileType' in response;
}
