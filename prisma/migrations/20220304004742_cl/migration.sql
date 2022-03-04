/*
  Warnings:

  - You are about to drop the column `user_id` on the `user_points` table. All the data in the column will be lost.
  - You are about to drop the `tournament_prize` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `prize_claim` DROP FOREIGN KEY `prize_claim_tournamentRewardId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_prize` DROP FOREIGN KEY `tournament_prize_rewardId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_prize` DROP FOREIGN KEY `tournament_prize_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_prize` DROP FOREIGN KEY `tournament_prize_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_winner` DROP FOREIGN KEY `tournament_winner_tournamentRewardId_fkey`;

-- DropForeignKey
ALTER TABLE `user_points` DROP FOREIGN KEY `user_points_user_id_fkey`;

-- AlterTable
ALTER TABLE `user_points` DROP COLUMN `user_id`,
    ADD COLUMN `userId` INTEGER NULL;

-- DropTable
DROP TABLE `tournament_prize`;

-- CreateTable
CREATE TABLE `tournament_reward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `rewardId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_reward` ADD CONSTRAINT `tournament_reward_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_reward` ADD CONSTRAINT `tournament_reward_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_reward` ADD CONSTRAINT `tournament_reward_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_winner` ADD CONSTRAINT `tournament_winner_tournamentRewardId_fkey` FOREIGN KEY (`tournamentRewardId`) REFERENCES `tournament_reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_claim` ADD CONSTRAINT `prize_claim_tournamentRewardId_fkey` FOREIGN KEY (`tournamentRewardId`) REFERENCES `tournament_reward`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_points` ADD CONSTRAINT `user_points_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
