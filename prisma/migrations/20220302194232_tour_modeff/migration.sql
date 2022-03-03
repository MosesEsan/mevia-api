/*
  Warnings:

  - You are about to drop the `TournamentMode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TournamentMode` DROP FOREIGN KEY `TournamentMode_game_mode_id_fkey`;

-- DropForeignKey
ALTER TABLE `TournamentMode` DROP FOREIGN KEY `TournamentMode_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_game` DROP FOREIGN KEY `tournament_game_tournament_mode_id_fkey`;

-- DropTable
DROP TABLE `TournamentMode`;

-- CreateTable
CREATE TABLE `tournament_mode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `game_mode_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_mode` ADD CONSTRAINT `tournament_mode_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_mode` ADD CONSTRAINT `tournament_mode_game_mode_id_fkey` FOREIGN KEY (`game_mode_id`) REFERENCES `game_mode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_tournament_mode_id_fkey` FOREIGN KEY (`tournament_mode_id`) REFERENCES `tournament_mode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
