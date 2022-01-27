/*
  Warnings:

  - Added the required column `tournament_mode_id` to the `tournament_game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tournament_game` ADD COLUMN `tournament_mode_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_tournament_mode_id_fkey` FOREIGN KEY (`tournament_mode_id`) REFERENCES `tournament_mode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
