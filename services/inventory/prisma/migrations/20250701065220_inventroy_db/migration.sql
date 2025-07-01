/*
  Warnings:

  - You are about to drop the column `quantityChange` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `History` table. All the data in the column will be lost.
  - Added the required column `quantityChanged` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_inventoryId_fkey";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "quantityChange",
DROP COLUMN "updatedAt",
ADD COLUMN     "quantityChanged" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
