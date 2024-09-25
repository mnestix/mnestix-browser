'use server';

import { ConnectionType } from '@prisma/client';
import { DataSourceFormData, PrismaConnector } from 'lib/services/multiple-repository-access/PrismaConnector';

export async function getConnectionDataAction() {
    const prismaConnector = PrismaConnector.create();
    return prismaConnector.getConnectionData();
}

export async function upsertConnectionDataAction(formDataInput: DataSourceFormData[]) {
    const prismaConnector = PrismaConnector.create();
    return prismaConnector.upsertConnectionDataAction(formDataInput);
}

export async function getConnectionDataByTypeAction(type: ConnectionType) {
    const prismaConnector = PrismaConnector.create();
    return prismaConnector.getConnectionDataByTypeAction(type);
}
