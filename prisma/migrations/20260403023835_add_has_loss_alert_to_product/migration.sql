/*
  Warnings:

  - You are about to drop the column `hpp` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[batchNumber]` on the table `StockBatch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchNumber` to the `StockBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "hpp",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hasLossAlert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hppAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isBundle" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StockBatch" ADD COLUMN     "batchNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BundleComponent" (
    "id" TEXT NOT NULL,
    "bundleProductId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "BundleComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BundleComponent_bundleProductId_componentId_key" ON "BundleComponent"("bundleProductId", "componentId");

-- CreateIndex
CREATE UNIQUE INDEX "StockBatch_batchNumber_key" ON "StockBatch"("batchNumber");

-- AddForeignKey
ALTER TABLE "BundleComponent" ADD CONSTRAINT "BundleComponent_bundleProductId_fkey" FOREIGN KEY ("bundleProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleComponent" ADD CONSTRAINT "BundleComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
