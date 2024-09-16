-- CreateTable
CREATE TABLE "ConnectionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MnestixConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    CONSTRAINT "MnestixConnection_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConnectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

--- CHANGED MANUALLY ---
-- Insert ConnectionType Enum values as SQLite does not support Enums
-- Create a new migration if you need to expand this Enum!
INSERT INTO "ConnectionType" (id, typeName) 
VALUES (0, 'AAS_REPOSITORY'),
        (1, 'AAS_REGISTRY'),
        (2, 'SUBMODEL_REPOSITORY'),
        (3, 'SUBMODEL_REGISTRY'),
        (4, 'DISCOVERY_SERVICE'),
        (5, 'CONCEPT_DESCRIPTION');
