/*
  Warnings:

  - You are about to drop the column `tournamentGameId` on the `game_question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `game_question` DROP FOREIGN KEY `game_question_tournamentGameId_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_question` DROP FOREIGN KEY `tournament_question_questionId_fkey`;

-- AlterTable
ALTER TABLE `game_question` DROP COLUMN `tournamentGameId`,
    ADD COLUMN `tournamentTriviaQuestionsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `tournament_trivia_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `time` INTEGER NOT NULL,
    `choice_one` TEXT NOT NULL,
    `choice_two` TEXT NOT NULL,
    `choice_three` TEXT NOT NULL,
    `choice_four` TEXT NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `questionTypeId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_question` ADD CONSTRAINT `game_question_tournamentTriviaQuestionsId_fkey` FOREIGN KEY (`tournamentTriviaQuestionsId`) REFERENCES `tournament_trivia_questions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_trivia_questions` ADD CONSTRAINT `tournament_trivia_questions_questionTypeId_fkey` FOREIGN KEY (`questionTypeId`) REFERENCES `question_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_trivia_questions` ADD CONSTRAINT `tournament_trivia_questions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `question_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_question` ADD CONSTRAINT `tournament_question_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `tournament_trivia_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
