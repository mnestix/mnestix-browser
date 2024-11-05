import { IPrismaConnector } from 'lib/services/database/PrismaConnectorInterface';
import { DataSourceFormData } from 'lib/services/database/PrismaConnector';

export class PrismaConnectorInMemory implements IPrismaConnector {
    constructor(
        protected aasData: string[],
        protected submodelData: string[],
    ) {}

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

    async getConnectionDataByTypeAction(type: { id: string; typeName: string }): Promise<string[]> {
        switch (type) {
            case { id: '0', typeName: 'AAS_REPOSITORY' }:
                return this.aasData;
            case { id: '2', typeName: 'SUBMODEL_REPOSITORY' }:
                return this.aasData;
            default:
                throw new Error('Method not implemented.');
        }
    }
}
