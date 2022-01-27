-- AlterTable
ALTER TABLE `game_question` ADD COLUMN `tournamentGameId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Tournament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `daily_points` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `no_of_questions` INTEGER NOT NULL,
    `easy` BOOLEAN NOT NULL DEFAULT true,
    `intermediate` BOOLEAN NOT NULL DEFAULT false,
    `hard` BOOLEAN NOT NULL DEFAULT false,
    `bonus` BOOLEAN NOT NULL DEFAULT false,
    `bonus_points` INTEGER NOT NULL,

    UNIQUE INDEX `Mode_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_mode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `tournament_id` INTEGER NOT NULL,
    `mode_id` INTEGER NOT NULL,

    UNIQUE INDEX `tournament_mode_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TournamentUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TournamentGame` (
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
CREATE TABLE `tournament_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `correct` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_question` ADD CONSTRAINT `game_question_tournamentGameId_fkey` FOREIGN KEY (`tournamentGameId`) REFERENCES `TournamentGame`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_mode` ADD CONSTRAINT `tournament_mode_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_mode` ADD CONSTRAINT `tournament_mode_mode_id_fkey` FOREIGN KEY (`mode_id`) REFERENCES `Mode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentUser` ADD CONSTRAINT `TournamentUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentUser` ADD CONSTRAINT `TournamentUser_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentGame` ADD CONSTRAINT `TournamentGame_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentGame` ADD CONSTRAINT `TournamentGame_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_question` ADD CONSTRAINT `tournament_question_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_question` ADD CONSTRAINT `tournament_question_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
