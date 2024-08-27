'use server';
import { prisma } from 'lib/database/prisma';
import { ConnectionType } from '@prisma/client';

export async function getConnectionDataAction() {
    return prisma?.mnestixConnection.findMany({ include: { type: true } });
}

export async function getConnectionDataByTypeAction(type: ConnectionType) {
    const basePath = await prisma?.mnestixConnection.findMany({
        where: {
            type: type,
        },
    });

    return basePath.map((item) => item.url);
}