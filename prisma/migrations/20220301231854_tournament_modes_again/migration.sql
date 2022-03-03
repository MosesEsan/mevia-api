/*
  Warnings:

  - You are about to drop the column `tournament_id` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the `tournament_modes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Tournament` DROP FOREIGN KEY `Tournament_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_game` DROP FOREIGN KEY `tournament_game_tournament_mode_id_fkey`;

-- AlterTable
ALTER TABLE `Tournament` DROP COLUMN `tournament_id`;

-- AlterTable
ALTER TABLE `tournament_game` ADD COLUMN `gameModesId` INTEGER NULL;

-- DropTable
DROP TABLE `tournament_modes`;

-- CreateTable
CREATE TABLE `game_modes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lives` INTEGER NULL,
    `easy` INTEGER NOT NULL,
    `intermediate` INTEGER NOT NULL,
    `hard` INTEGER NOT NULL,
    `bonus` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TournamentMode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `game_mode_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TournamentMode` ADD CONSTRAINT `TournamentMode_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentMode` ADD CONSTRAINT `TournamentMode_game_mode_id_fkey` FOREIGN KEY (`game_mode_id`) REFERENCES `game_modes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_tournament_mode_id_fkey` FOREIGN KEY (`tournament_mode_id`) REFERENCES `TournamentMode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_gameModesId_fkey` FOREIGN KEY (`gameModesId`) REFERENCES `game_modes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
