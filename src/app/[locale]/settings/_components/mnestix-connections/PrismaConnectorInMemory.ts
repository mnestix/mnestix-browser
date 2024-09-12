import { IPrismaConnector } from 'app/[locale]/settings/_components/mnestix-connections/PrismaConnectorInterface';
import { DataSourceFormData } from 'app/[locale]/settings/_components/mnestix-connections/PrismaConnector';

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
