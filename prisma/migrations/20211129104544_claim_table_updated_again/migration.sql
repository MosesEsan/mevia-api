/*
  Warnings:

  - You are about to drop the column `dailyPrizeId` on the `PrizeClaim` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyChallengeId` on the `PrizeClaim` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyPrizesId` on the `PrizeClaim` table. All the data in the column will be lost.
  - Added the required column `weekly_prize_id` to the `PrizeClaim` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_dailyPrizeId_fkey`;

-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_weeklyChallengeId_fkey`;

-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_weeklyPrizesId_fkey`;

-- AlterTable
ALTER TABLE `PrizeClaim` DROP COLUMN `dailyPrizeId`,
    DROP COLUMN `weeklyChallengeId`,
    DROP COLUMN `weeklyPrizesId`,
    ADD COLUMN `weekly_prize_id` INTEGER NOT NULL,
    MODIFY `dateClaimed` DATETIME(3) NULL,
    MODIFY `dateDelivered` DATETIME(3) NULL,
    MODIFY `dateSent` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_weekly_prize_id_fkey` FOREIGN KEY (`weekly_prize_id`) REFERENCES `weekly_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
