import { encodeBase64 } from 'lib/util/Base64Util';
import { ApiResponseWrapper } from 'lib/services/apiResponseWrapper';
import { SubmodelDescriptor } from 'lib/types/registryServiceTypes';

export class SubmodelRegistryServiceApi {
    baseUrl: string;

    constructor(
        protected http: {
            fetch(url: RequestInfo | URL, init?: RequestInit): Promise<ApiResponseWrapper<string>>;
        },
        protected _baseUrl: string = '',
    ) {
        this.baseUrl = _baseUrl;
    }

    public async getSubmodelDescriptorsById(submodelId: string) {
        const b64_submodelId = encodeBase64(submodelId);

        const headers = {
            Accept: 'application/json',
        };

        const url = new URL(`${this.baseUrl}/submodel-descriptors/${b64_submodelId}`);

        const response = await this.http.fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        console.log('Mana mana ');
        console.log('response: ', response);

        return response.transformResult<SubmodelDescriptor>(JSON.parse);
    }
}
