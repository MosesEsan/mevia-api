/*
  Warnings:

  - You are about to drop the column `winnerId` on the `PrizeClaim` table. All the data in the column will be lost.
  - You are about to drop the `Winner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_winnerId_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_weeklyPrizeId_fkey`;

-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_weekly_challenge_id_fkey`;

-- AlterTable
ALTER TABLE `PrizeClaim` DROP COLUMN `winnerId`,
    ADD COLUMN `dateClaimed` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dateDelivered` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dateSent` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `Winner`;
