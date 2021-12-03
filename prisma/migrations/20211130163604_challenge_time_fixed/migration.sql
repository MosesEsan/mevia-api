/*
  Warnings:

  - You are about to drop the column `delivered` on the `weekly_prize` table. All the data in the column will be lost.
  - You are about to drop the column `sent` on the `weekly_prize` table. All the data in the column will be lost.
  - You are about to drop the `challengeTimes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `weekly_prize` DROP COLUMN `delivered`,
    DROP COLUMN `sent`,
    MODIFY `dateClaimed` DATETIME(3) NULL;

-- DropTable
DROP TABLE `challengeTimes`;

-- CreateTable
CREATE TABLE `game_time` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `daily` BOOLEAN NOT NULL DEFAULT false,
    `startTime` TIME(3) NOT NULL,
    `endTime` TIME(3) NOT NULL,

    UNIQUE INDEX `game_time_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
