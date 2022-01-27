/*
  Warnings:

  - You are about to drop the `TournamentGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TournamentGame` DROP FOREIGN KEY `TournamentGame_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `TournamentGame` DROP FOREIGN KEY `TournamentGame_userId_fkey`;

-- DropForeignKey
ALTER TABLE `game_question` DROP FOREIGN KEY `game_question_tournamentGameId_fkey`;

-- AlterTable
ALTER TABLE `prize_claim` ADD COLUMN `tournamentPrizeId` INTEGER NULL;

-- DropTable
DROP TABLE `TournamentGame`;

-- CreateTable
CREATE TABLE `tournament_game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `timeAvailable` INTEGER NULL,
    `pointsAvailable` INTEGER NULL,
    `pointsObtained` INTEGER NULL,
    `correct_answers` INTEGER NULL,
    `wrong_answers` INTEGER NULL,
    `skipped` INTEGER NULL,
    `percent` DOUBLE NULL,
    `initiatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nextGameAt` TIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_prize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `prizeId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `dateClaimed` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_question` ADD CONSTRAINT `game_question_tournamentGameId_fkey` FOREIGN KEY (`tournamentGameId`) REFERENCES `tournament_game`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_prize` ADD CONSTRAINT `tournament_prize_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_prize` ADD CONSTRAINT `tournament_prize_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `Prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_prize` ADD CONSTRAINT `tournament_prize_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_claim` ADD CONSTRAINT `prize_claim_tournamentPrizeId_fkey` FOREIGN KEY (`tournamentPrizeId`) REFERENCES `tournament_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
