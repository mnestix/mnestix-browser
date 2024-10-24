import { ApiResultStatus, WrapErrorCode, WrapResponse, WrapSuccess } from 'lib/services/apiResponseWrapper';
import { expect } from '@jest/globals';

describe('', () => {
    it('transforms the http code to a success code', async () => {
        const response = new Response(JSON.stringify('dummy value'));
        const successfulResponseWrapper = await WrapResponse(response);
        expect(successfulResponseWrapper.isSuccess).toBe(true);
        if (!successfulResponseWrapper.isSuccess) {
            expect(successfulResponseWrapper.errorCode).toBe(ApiResultStatus.SUCCESS);
        }
    });

    it('return data on success', async () => {
        const data = { name: 'John', age: 42 };
        const responseWrapper = WrapSuccess(data);

        expect(responseWrapper.isSuccess).toBe(true);
        if (responseWrapper.isSuccess) {
            expect(responseWrapper.result).toBe(data);
        }
    });

    it('keep the error code', async () => {
        const message = 'something bad happened';
        const responseWrapper = WrapErrorCode(ApiResultStatus.INTERNAL_SERVER_ERROR, message);

        expect(responseWrapper.isSuccess).toBe(false);
        if (!responseWrapper.isSuccess) {
            expect(responseWrapper.result).toBe(undefined);
            expect(responseWrapper.errorCode).toBe(ApiResultStatus.INTERNAL_SERVER_ERROR);
            expect(responseWrapper.message).toBe(message);
        }
    });
});
