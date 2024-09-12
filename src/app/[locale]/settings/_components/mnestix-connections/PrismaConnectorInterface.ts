import { ConnectionType } from '@prisma/client';
import { DataSourceFormData } from 'app/[locale]/settings/_components/mnestix-connections/PrismaConnector';

export interface IPrismaConnector {
    getConnectionData(): unknown;

    upsertConnectionDataAction(formDataInput: DataSourceFormData[]): Promise<void>;

    getConnectionDataByTypeAction(type: ConnectionType): Promise<string[]>;
}
