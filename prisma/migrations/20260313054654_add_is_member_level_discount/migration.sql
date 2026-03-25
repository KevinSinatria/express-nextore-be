/*
  Warnings:

  - You are about to drop the column `points` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "isMemberLevel" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "points";
