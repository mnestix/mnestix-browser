import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';
import { ConfigurationShellApiInterface } from 'lib/api/configuration-shell-api/configurationShellApiInterface';

export class ConfigurationShellApi implements ConfigurationShellApiInterface {
    private http: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> };
    basePath: string;
    use_authentication: boolean;

    private constructor(
        protected _basePath: string = '',
        use_authentication: boolean,
        http?: { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> },
    ) {
        this.http = http ? http : window;
        this.basePath = _basePath;
        this.use_authentication = use_authentication;
    }

    static create(
        _baseUrl: string = '',
        use_authentication: boolean,
        http?: {
            fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
        },
    ): ConfigurationShellApi {
        return new ConfigurationShellApi(_baseUrl, use_authentication, http ?? window);
    }

    async getIdGenerationSettings(): Promise<Submodel> {
        let url_ = this.basePath + '/configuration/idGeneration';
        url_ = url_.replace(/[?&]$/, '');

        const options_: RequestInit = {
            method: 'GET',
            headers: {},
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processGetIdGenerationSettings(_response);
        });
    }

    async processGetIdGenerationSettings(response: Response): Promise<Submodel> {
        const status = response.status;
        const _headers = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((v, k) => (_headers[k] = v));
        }
        if (status === 200) {
            //Here, we return the json so the next.js server can transport the object to the client
            //We should cast it to a Submodel AAS Core3 Type through jsonization.submodelFromJsonable(jsonableSubmodel);
            //However, then the returned object becomes to compolex for next.js server-client communication.
            //Wierdly, the typescript complier still reconginzes the returned object as a AAS Core Submodel,
            //so we seem to have no disadvantage from not casting.
            return response.json();
        } else if (status === 400) {
            const _responseText1 = await response.text();
            return _responseText1 === '' ? null : JSON.parse(_responseText1);
        } else if (status !== 200 && status !== 204) {
            const _responseText2 = await response.text();
            return _responseText2 === '' ? null : JSON.parse(_responseText2);
        }
        return Promise.resolve<Submodel>(null as never);
    }

    async putSingleIdGenerationSetting(
        idShort: string,
        bearerToken: string,
        values: {
            prefix: string;
            dynamicPart: string;
        },
    ) {
        await this.putSingleSettingValue(`${idShort}.Prefix`, bearerToken, values.prefix, 'idGeneration');
        await this.putSingleSettingValue(`${idShort}.DynamicPart`, bearerToken, values.dynamicPart, 'idGeneration');
    }

    async putSingleSettingValue(
        path: string,
        bearerToken: string,
        value: string,
        settingsType: string,
    ): Promise<void | Response> {
        let url_ = `${this.basePath}/configuration/${settingsType}/submodel-elements/${path}/$value`;
        url_ = url_.replace(/[?&]$/, '');

        const content_ = JSON.stringify(value);

        const options_: RequestInit = {
            body: content_,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return this.http.fetch(url_, options_).then((_response: Response) => {
            return this.processputSingleSettingValue(_response);
        });
    }

    async processputSingleSettingValue(response: Response): Promise<void | Response> {
        const status = response.status;
        const _headers = {};
        if (response.headers && response.headers.forEach) {
            response.headers.forEach((v, k) => (_headers[k] = v));
        }
        if (status >= 200 && status < 300) {
            return response;
        } else {
            throw response;
        }
    }
}
