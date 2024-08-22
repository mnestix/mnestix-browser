import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    /**
     * As SQLite does not support enums, we emulate the ConnectionType Enum through this prefilled table.
     */
    await prisma.connectionType.createMany({
        data: [
            {typeName: 'AAS_REPOSITORY'},
            {typeName: 'AAS_REGISTRY'},
            {typeName: 'SUBMODEL_REPOSITORY'},
            {typeName: 'SUBMODEL_REGISTRY'},
            {typeName: 'DISCOVERY_SERVICE'},
            {typeName: 'CONCEPT_DESCRIPTION'},
        ],
    })
}
main()
    .then(async () => {
        console.log("Database seeding succeeded.")
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })