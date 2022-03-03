/*
  Warnings:

  - You are about to drop the `tournament_mode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tournament_game` DROP FOREIGN KEY `tournament_game_tournament_mode_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_mode` DROP FOREIGN KEY `tournament_mode_tournament_id_fkey`;

-- AlterTable
ALTER TABLE `Tournament` ADD COLUMN `tournament_id` INTEGER NULL;

-- DropTable
DROP TABLE `tournament_mode`;

-- CreateTable
CREATE TABLE `tournament_modes` (
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
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournament_modes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_tournament_mode_id_fkey` FOREIGN KEY (`tournament_mode_id`) REFERENCES `tournament_modes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
