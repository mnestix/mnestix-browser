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
