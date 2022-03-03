/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `game_mode` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lives` on table `game_mode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `game_mode` MODIFY `lives` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `game_mode_name_key` ON `game_mode`(`name`);
