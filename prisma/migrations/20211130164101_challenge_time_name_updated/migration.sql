/*
  Warnings:

  - You are about to drop the `game_time` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `game_time`;

-- CreateTable
CREATE TABLE `challenge_time` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `daily` BOOLEAN NOT NULL DEFAULT false,
    `startTime` TIME(3) NOT NULL,
    `endTime` TIME(3) NOT NULL,

    UNIQUE INDEX `challenge_time_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
