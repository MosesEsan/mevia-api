/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_points` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user_points` MODIFY `source` ENUM('REGISTRATION', 'GAME', 'DAILY_REWARD', 'TOURNAMENT') NOT NULL DEFAULT 'REGISTRATION';

-- CreateIndex
CREATE UNIQUE INDEX `user_points_user_id_key` ON `user_points`(`user_id`);
