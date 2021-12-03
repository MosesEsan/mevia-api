/*
  Warnings:

  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_prize` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `daily_prize` DROP FOREIGN KEY `daily_prize_prizeId_fkey`;

-- AlterTable
ALTER TABLE `weekly_challenge` MODIFY `startDate` DATETIME(3) NULL;

-- DropTable
DROP TABLE `Challenge`;

-- DropTable
DROP TABLE `daily_prize`;

-- CreateTable
CREATE TABLE `challengeTimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `daily` BOOLEAN NOT NULL DEFAULT false,
    `startTime` TIME(3) NOT NULL,
    `endTime` TIME(3) NOT NULL,

    UNIQUE INDEX `challengeTimes_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
