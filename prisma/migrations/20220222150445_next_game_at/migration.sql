/*
  Warnings:

  - You are about to drop the column `nextGameAt` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Game` DROP COLUMN `nextGameAt`,
    ADD COLUMN `next_game_at` DATETIME(3) NULL;
