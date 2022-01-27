/*
  Warnings:

  - You are about to drop the column `userId` on the `tournament_game` table. All the data in the column will be lost.
  - You are about to alter the column `next_game_at` on the `tournament_game` table. The data in that column could be lost. The data in that column will be cast from `Time(3)` to `DateTime(3)`.
  - Added the required column `user_id` to the `tournament_game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tournament_game` DROP FOREIGN KEY `tournament_game_userId_fkey`;

-- AlterTable
ALTER TABLE `tournament_game` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `next_game_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tournament_mode` ADD COLUMN `lives` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tournament_game` ADD CONSTRAINT `tournament_game_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
