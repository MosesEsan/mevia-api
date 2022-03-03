/*
  Warnings:

  - You are about to drop the column `tournamentPrizeId` on the `prize_claim` table. All the data in the column will be lost.
  - You are about to drop the column `prizeId` on the `tournament_prize` table. All the data in the column will be lost.
  - You are about to drop the column `tournamentPrizeId` on the `tournament_winner` table. All the data in the column will be lost.
  - You are about to drop the `tournament_prize_claim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tournament_reward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rewardId` to the `tournament_prize` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentRewardId` to the `tournament_winner` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `prize_claim` DROP FOREIGN KEY `prize_claim_tournamentPrizeId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_prize` DROP FOREIGN KEY `tournament_prize_prizeId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_prize_claim` DROP FOREIGN KEY `tournament_prize_claim_tournament_winner_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_reward` DROP FOREIGN KEY `tournament_reward_tournamentPrizeId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_reward` DROP FOREIGN KEY `tournament_reward_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_winner` DROP FOREIGN KEY `tournament_winner_tournamentPrizeId_fkey`;

-- AlterTable
ALTER TABLE `prize_claim` DROP COLUMN `tournamentPrizeId`,
    ADD COLUMN `tournamentRewardId` INTEGER NULL;

-- AlterTable
ALTER TABLE `tournament_prize` DROP COLUMN `prizeId`,
    ADD COLUMN `rewardId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tournament_winner` DROP COLUMN `tournamentPrizeId`,
    ADD COLUMN `tournamentRewardId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `tournament_prize_claim`;

-- DropTable
DROP TABLE `tournament_reward`;

-- AddForeignKey
ALTER TABLE `tournament_prize` ADD CONSTRAINT `tournament_prize_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_winner` ADD CONSTRAINT `tournament_winner_tournamentRewardId_fkey` FOREIGN KEY (`tournamentRewardId`) REFERENCES `tournament_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_claim` ADD CONSTRAINT `prize_claim_tournamentRewardId_fkey` FOREIGN KEY (`tournamentRewardId`) REFERENCES `tournament_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
