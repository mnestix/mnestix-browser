import { IPrismaConnector } from 'lib/services/connection-access/PrismaConnectorInterface';
import { DataSourceFormData } from 'lib/services/connection-access/PrismaConnector';

export class PrismaConnectorInMemory implements IPrismaConnector {
    constructor(protected connectionData: string[]) {}

    getConnectionData(): Promise<
        { type: { id: string; typeName: string } } & {
            id: string;
            url: string;
            typeId: string;
        }
    > {
        throw new Error('Method not implemented.');
    }

    upsertConnectionDataAction(_formDataInput: DataSourceFormData[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getConnectionDataByTypeAction(_type: { id: string; typeName: string }): Promise<string[]> {
        return Promise.resolve(this.connectionData);
    }
}
