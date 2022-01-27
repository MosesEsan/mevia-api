/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TournamentUser` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedAt` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `nextGameAt` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `pointsAvailable` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `pointsObtained` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `timeAvailable` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the column `tournament_id` on the `tournament_question` table. All the data in the column will be lost.
  - Added the required column `end_date` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entry_fee` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_players` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentGameId` to the `tournament_question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tournament_question` DROP FOREIGN KEY `tournament_question_tournament_id_fkey`;

-- AlterTable
ALTER TABLE `Tournament` DROP COLUMN `createdAt`,
    DROP COLUMN `endDate`,
    DROP COLUMN `startDate`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `end_date` DATE NOT NULL,
    ADD COLUMN `end_time` TIME(3) NOT NULL,
    ADD COLUMN `entry_fee` INTEGER NOT NULL,
    ADD COLUMN `max_players` INTEGER NOT NULL,
    ADD COLUMN `start_date` DATE NOT NULL,
    ADD COLUMN `start_time` TIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `TournamentUser` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `tournament_game` DROP COLUMN `initiatedAt`,
    DROP COLUMN `nextGameAt`,
    DROP COLUMN `pointsAvailable`,
    DROP COLUMN `pointsObtained`,
    DROP COLUMN `submittedAt`,
    DROP COLUMN `timeAvailable`,
    ADD COLUMN `initiated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `next_game_at` TIME(3) NULL,
    ADD COLUMN `points_available` INTEGER NULL,
    ADD COLUMN `points_obtained` INTEGER NULL,
    ADD COLUMN `submitted_at` DATETIME(3) NULL,
    ADD COLUMN `time_available` INTEGER NULL;

-- AlterTable
ALTER TABLE `tournament_question` DROP COLUMN `tournament_id`,
    ADD COLUMN `tournamentGameId` INTEGER NOT NULL,
    ADD COLUMN `tournamentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tournament_question` ADD CONSTRAINT `tournament_question_tournamentGameId_fkey` FOREIGN KEY (`tournamentGameId`) REFERENCES `tournament_game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_question` ADD CONSTRAINT `tournament_question_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
