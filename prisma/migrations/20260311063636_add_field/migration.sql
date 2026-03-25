-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "isTransactionLevel" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "totalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_DiscountToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscountToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DiscountToTransaction_B_index" ON "_DiscountToTransaction"("B");

-- AddForeignKey
ALTER TABLE "_DiscountToTransaction" ADD CONSTRAINT "_DiscountToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountToTransaction" ADD CONSTRAINT "_DiscountToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
