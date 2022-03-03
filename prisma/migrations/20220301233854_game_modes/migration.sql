/*
  Warnings:

  - You are about to drop the column `gameModesId` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to drop the `game_modes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TournamentMode` DROP FOREIGN KEY `TournamentMode_game_mode_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_game` DROP FOREIGN KEY `tournament_game_gameModesId_fkey`;

-- AlterTable
ALTER TABLE `tournament_game` DROP COLUMN `gameModesId`,
    ADD COLUMN `gameModeId` INTEGER NULL;

-- DropTable
DROP TABLE `game_modes`;

-- CreateTable
CREATE TABLE `game_mode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lives` INTEGER NULL,
    `easy` INTEGER NOT NULL,
    `intermediate` INTEGER NOT NULL,
    `hard` INTEGER NOT NULL,
    `bonus` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TournamentMode` ADD CONSTRAINT `TournamentMode_game_mode_id_fkey` FOREIGN KEY (`game_mode_id`) REFERENCES `game_mode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_gameModeId_fkey` FOREIGN KEY (`gameModeId`) REFERENCES `game_mode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
