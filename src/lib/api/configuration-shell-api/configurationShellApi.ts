import { Submodel } from '@aas-core-works/aas-core3.0-typescript/types';

export class ConfigurationShellApi {
    basePath: string;

    constructor(protected _basePath: string = '') {
        this.basePath = _basePath;
    }

    public async getIdGenerationSettings(bearerToken: string, use_authentication: boolean): Promise<Submodel> {
        const headers = {
            Accept: 'application/json',
        };
        if (use_authentication) {
            headers['Authorization'] = bearerToken;
        }

        const response = await fetch(`${this.basePath}/configuration/idGeneration`, {
            method: 'GET',
            headers,
        });

        if (response.status >= 200 && response.status < 300) {
            return response.json();
        } else {
            throw response;
        }
    }

    public async putSingleIdGenerationSetting(
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

    protected async putSingleSettingValue(
        path: string,
        bearerToken: string,
        value: string,
        settingsType: string,
        use_authentication: boolean = true,
    ): Promise<void | Response> {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (use_authentication) {
            headers['Authorization'] = bearerToken;
        }

        const response = await fetch(
            `${this.basePath}/configuration/${settingsType}/submodel-elements/${path}/$value`,
            {
                method: 'PATCH',
                headers,
                body: '"' + value + '"',
            },
        );

        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            throw response;
        }
    }
}
