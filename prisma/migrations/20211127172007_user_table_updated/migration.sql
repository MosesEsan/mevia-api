/*
  Warnings:

  - You are about to drop the column `weeklyPrizesId` on the `Winner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[image]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Winner` DROP FOREIGN KEY `Winner_weeklyPrizesId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Winner` DROP COLUMN `weeklyPrizesId`,
    ADD COLUMN `weeklyPrizeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_image_key` ON `User`(`image`);

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_weeklyPrizeId_fkey` FOREIGN KEY (`weeklyPrizeId`) REFERENCES `weekly_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
