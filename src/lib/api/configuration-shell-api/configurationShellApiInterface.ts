import { Submodel } from '@aas-core-works/aas-core3.0-typescript/dist/types/types';

export interface ConfigurationShellApiInterface {
    getIdGenerationSettings(): Promise<Submodel>;

    processGetIdGenerationSettings(response: Response): Promise<Submodel>;

    putSingleIdGenerationSetting(
        idShort: string,
        bearerToken: string,
        values: {
            prefix: string;
            dynamicPart: string;
        },
    ): Promise<void>;

    putSingleSettingValue(
        path: string,
        bearerToken: string,
        value: string,
        settingsType: string,
    ): Promise<void | Response>;

    processputSingleSettingValue(response: Response): Promise<void | Response>;
}
