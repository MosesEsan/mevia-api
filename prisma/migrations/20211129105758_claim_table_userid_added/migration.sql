/*
  Warnings:

  - You are about to drop the column `winner` on the `weekly_prize` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[weekly_prize_id]` on the table `PrizeClaim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `PrizeClaim` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `weekly_prize` DROP FOREIGN KEY `weekly_prize_winner_fkey`;

-- AlterTable
ALTER TABLE `PrizeClaim` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `weekly_prize` DROP COLUMN `winner`,
    ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PrizeClaim_weekly_prize_id_key` ON `PrizeClaim`(`weekly_prize_id`);

-- AddForeignKey
ALTER TABLE `weekly_prize` ADD CONSTRAINT `weekly_prize_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
