import { ApiResponseWrapper, ApiResultMapper } from 'lib/services/apiResponseWrapper';
import { AssetAdministrationShell } from '@aas-core-works/aas-core3.0-typescript/types';
import { expect } from '@jest/globals';

describe('', () => {
    it('transforms a json into a specific result', async () => {
        const data =
            '{\n' +
            '  "id": "https://mnestix.com/aas/MnestixTestAas2",\n' +
            '  "idShort": "MnestixTestAas",\n' +
            '  "modelType": "AssetAdministrationShell",\n' +
            '  "assetInformation": {\n' +
            '    "assetKind": "Instance",\n' +
            '    "globalAssetId": "https://mnestix.com/aas/MnestixTestAsset",\n' +
            '    "specificAssetId": "aas_MnestixTestAsset",\n' +
            '    "specificAssetIds": [\n' +
            '      {\n' +
            '        "name": "assetIdShort",\n' +
            '        "value": "TestAsset"\n' +
            '      },\n' +
            '      {\n' +
            '        "name": "serialNumber",\n' +
            '        "value": "123456"\n' +
            '      }\n' +
            '    ]\n' +
            '  },\n' +
            '  "submodels": []\n' +
            '}';
        const stringApiWrapper = new ApiResponseWrapper(data, ApiResultMapper.SUCCESS, 'nonono');


        const result = stringApiWrapper.castResult<AssetAdministrationShell>();
    });

    it('throws error when attempting to interpret transform junk as junk', async () => {
        const data = '{r4nd0mJunk]]';
        const stringApiWrapper = new ApiResponseWrapper(data, ApiResultMapper.SUCCESS, 'nonono');

        expect(() => stringApiWrapper.transformResult(JSON.parse)).toThrow();
    });

    it('transforms the http code to an error code', async () => {
        const failedResponseWrapper = ApiResponseWrapper.fromHttpError(404, 'error message');

        expect(failedResponseWrapper.errorCode).toBe(ApiResultMapper.NOT_FOUND)
    });

    it('transforms the http code to a success code', async () => {
        const response = new Response(JSON.stringify('dummy value'));
        const successfulResponseWrapper = await ApiResponseWrapper.fromResponse(response);

        expect(successfulResponseWrapper.errorCode).toBe(ApiResultMapper.SUCCESS)
    });

});
