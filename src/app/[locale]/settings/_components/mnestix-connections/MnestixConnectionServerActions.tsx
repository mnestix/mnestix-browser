'use server'
import { prisma } from 'lib/database/prisma';

export async function getConnectionDataAction() {
    return prisma?.mnestixConnection.findMany({include: {type: true}});
}