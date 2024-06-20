export interface IdPrefix {
    exampleValue?: string | null;
    value?: string | null;
}

export interface IdDynamicPart {
    exampleValue?: string | null;
    value?: string | null;
    allowedValues: string[];
}

export interface IdGenerationSettingFrontend {
    name: string;
    idType?: string | null;
    prefix: IdPrefix;
    dynamicPart: IdDynamicPart;
}
