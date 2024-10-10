import { ConnectionType } from '@prisma/client';
import { DataSourceFormData } from 'lib/services/MultipleRepositorySearch/PrismaConnector';

export interface IPrismaConnector {
    getConnectionData(): unknown;

    upsertConnectionDataAction(formDataInput: DataSourceFormData[]): Promise<void>;

    getConnectionDataByTypeAction(type: ConnectionType): Promise<string[]>;
}