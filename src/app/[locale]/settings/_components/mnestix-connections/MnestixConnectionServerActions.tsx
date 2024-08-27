'use server'

import { prisma } from 'lib/database/prisma';
import { ConnectionFormData } from 'app/[locale]/settings/_components/mnestix-connections/MnestixConnectionsCard';

export async function getConnectionDataAction() {
    return prisma?.mnestixConnection.findMany({include: {type: true}});
}

export async function upsertConnectionDataAction(formData: ConnectionFormData) {
    // todo wrap in transaction -> update all or none
    const data = formData.repositories;
    const existingData = await prisma?.mnestixConnection.findMany({include: {type: true}});
    for (const existing of existingData) {
        const formData = data.find(value => value.id === existing.id)
        // If an entry exists in the db and the updated data, update the existing db entry
        if (formData) {
            await prisma.mnestixConnection.update({where: {id: existing.id}, data: {url: formData.url}});
            // If an entry exists in the db but NOT in the updated data, delete it from the db
        } else {
            await prisma.mnestixConnection.delete({where: {id: existing.id}})
        }
    }
    // If an entry doesn't exist in the db but in the updated data, create it in the db
    for (const updated of data) {
        const formData = existingData.find(value => value.id === updated.id)
        const type = await prisma.connectionType.findFirst({where: {typeName: updated.type}})
        if (!formData && type) {
            await prisma.mnestixConnection.create({data: {url: updated.url, typeId: type.id}})
        }
    }
}

export async function resetConnectionTable() {
    await prisma.mnestixConnection.deleteMany({})
}