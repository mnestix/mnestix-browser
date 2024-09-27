import { IPrismaConnector } from 'lib/services/repository-access/PrismaConnectorInterface';
import { DataSourceFormData } from 'lib/services/repository-access/PrismaConnector';

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
