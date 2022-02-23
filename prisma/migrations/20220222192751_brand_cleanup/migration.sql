/*
  Warnings:

  - You are about to drop the column `brandId` on the `gift_card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `gift_card` DROP FOREIGN KEY `gift_card_brandId_fkey`;

-- AlterTable
ALTER TABLE `gift_card` DROP COLUMN `brandId`;
