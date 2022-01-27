/*
  Warnings:

  - You are about to drop the column `tournamentId` on the `tournament_question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tournament_question` DROP FOREIGN KEY `tournament_question_tournamentId_fkey`;

-- AlterTable
ALTER TABLE `tournament_question` DROP COLUMN `tournamentId`;
