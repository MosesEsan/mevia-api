/*
  Warnings:

  - Made the column `userId` on table `user_points` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `user_points` DROP FOREIGN KEY `user_points_userId_fkey`;

-- AlterTable
ALTER TABLE `user_points` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `user_points` ADD CONSTRAINT `user_points_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
