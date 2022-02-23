/*
  Warnings:

  - You are about to drop the column `redeemId` on the `gift_card` table. All the data in the column will be lost.
  - You are about to drop the column `tournamentPrizeId` on the `gift_card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `gift_card` DROP FOREIGN KEY `gift_card_redeemId_fkey`;

-- DropForeignKey
ALTER TABLE `gift_card` DROP FOREIGN KEY `gift_card_tournamentPrizeId_fkey`;

-- AlterTable
ALTER TABLE `Redeem` ADD COLUMN `giftCardId` INTEGER NULL;

-- AlterTable
ALTER TABLE `gift_card` DROP COLUMN `redeemId`,
    DROP COLUMN `tournamentPrizeId`;

-- AddForeignKey
ALTER TABLE `Redeem` ADD CONSTRAINT `Redeem_giftCardId_fkey` FOREIGN KEY (`giftCardId`) REFERENCES `gift_card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
