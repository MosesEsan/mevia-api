/*
  Warnings:

  - You are about to drop the column `address_line_one` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `reedemId` on the `gift_card` table. All the data in the column will be lost.
  - You are about to drop the `Reedem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Reedem` DROP FOREIGN KEY `Reedem_rewardId_fkey`;

-- DropForeignKey
ALTER TABLE `Reedem` DROP FOREIGN KEY `Reedem_userId_fkey`;

-- DropForeignKey
ALTER TABLE `gift_card` DROP FOREIGN KEY `gift_card_reedemId_fkey`;

-- AlterTable
ALTER TABLE `Brand` DROP COLUMN `address_line_one`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Reward` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `reward_type_id` INTEGER NULL,
    ADD COLUMN `terms` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `gift_card` DROP COLUMN `reedemId`,
    ADD COLUMN `redeemId` INTEGER NULL;

-- DropTable
DROP TABLE `Reedem`;

-- CreateTable
CREATE TABLE `reward_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redeem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rewardId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_reward_type_id_fkey` FOREIGN KEY (`reward_type_id`) REFERENCES `reward_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redeem` ADD CONSTRAINT `Redeem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redeem` ADD CONSTRAINT `Redeem_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_redeemId_fkey` FOREIGN KEY (`redeemId`) REFERENCES `Redeem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
