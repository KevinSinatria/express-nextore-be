-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "unit" VARCHAR(50) NOT NULL DEFAULT 'pcs';

-- AlterTable
ALTER TABLE "StockBatch" ADD COLUMN     "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "posId" TEXT;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'global-setting',
    "expiredReminderDays" INTEGER NOT NULL DEFAULT 7,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_posId_fkey" FOREIGN KEY ("posId") REFERENCES "pos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
