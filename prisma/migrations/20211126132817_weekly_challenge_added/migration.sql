/*
  Warnings:

  - You are about to drop the column `daily_prize_id` on the `PrizeClaim` table. All the data in the column will be lost.
  - You are about to drop the column `daily_prize_id` on the `Winner` table. All the data in the column will be lost.
  - Added the required column `weekly_challenge_id` to the `Winner` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_daily_prize_id_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_daily_prize_id_fkey`;

-- AlterTable
ALTER TABLE `PrizeClaim` DROP COLUMN `daily_prize_id`,
    ADD COLUMN `dailyPrizeId` INTEGER NULL,
    ADD COLUMN `weeklyChallengeId` INTEGER NULL,
    ADD COLUMN `weeklyPrizesId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Winner` DROP COLUMN `daily_prize_id`,
    ADD COLUMN `weeklyPrizesId` INTEGER NULL,
    ADD COLUMN `weekly_challenge_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `weekly_challenge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_prize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `weekly_challenge_id` INTEGER NOT NULL,
    `prizeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `weekly_prize` ADD CONSTRAINT `weekly_prize_weekly_challenge_id_fkey` FOREIGN KEY (`weekly_challenge_id`) REFERENCES `weekly_challenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_prize` ADD CONSTRAINT `weekly_prize_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `Prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_weekly_challenge_id_fkey` FOREIGN KEY (`weekly_challenge_id`) REFERENCES `weekly_challenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_weeklyPrizesId_fkey` FOREIGN KEY (`weeklyPrizesId`) REFERENCES `weekly_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_dailyPrizeId_fkey` FOREIGN KEY (`dailyPrizeId`) REFERENCES `daily_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_weeklyChallengeId_fkey` FOREIGN KEY (`weeklyChallengeId`) REFERENCES `weekly_challenge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_weeklyPrizesId_fkey` FOREIGN KEY (`weeklyPrizesId`) REFERENCES `weekly_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
