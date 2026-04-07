/*
  Warnings:

  - You are about to drop the `Pos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pos" DROP CONSTRAINT "Pos_activeUserId_fkey";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activePosId" TEXT;

-- DropTable
DROP TABLE "Pos";

-- CreateTable
CREATE TABLE "pos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activeUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pos_activeUserId_key" ON "pos"("activeUserId");

-- AddForeignKey
ALTER TABLE "pos" ADD CONSTRAINT "pos_activeUserId_fkey" FOREIGN KEY ("activeUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
