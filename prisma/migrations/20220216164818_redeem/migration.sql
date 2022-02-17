/*
  Warnings:

  - Added the required column `rewardId` to the `gift_card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `gift_card` DROP FOREIGN KEY `gift_card_brandId_fkey`;

-- AlterTable
ALTER TABLE `gift_card` ADD COLUMN `reedemId` INTEGER NULL,
    ADD COLUMN `rewardId` INTEGER NOT NULL,
    MODIFY `brandId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Reedem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rewardId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reedem` ADD CONSTRAINT `Reedem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reedem` ADD CONSTRAINT `Reedem_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_reedemId_fkey` FOREIGN KEY (`reedemId`) REFERENCES `Reedem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
