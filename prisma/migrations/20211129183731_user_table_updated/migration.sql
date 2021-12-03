/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userTypeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[country_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[formatted_phone_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country_code` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formatted_phone_number` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_type_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_userTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_userTypeId_fkey`;

-- DropIndex
DROP INDEX `User_image_key` ON `User`;

-- DropIndex
DROP INDEX `User_phoneNumber_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `phoneNumber`,
    DROP COLUMN `userTypeId`,
    ADD COLUMN `country_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `formatted_phone_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_type_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Profile`;

-- CreateIndex
CREATE UNIQUE INDEX `User_country_code_key` ON `User`(`country_code`);

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_number_key` ON `User`(`phone_number`);

-- CreateIndex
CREATE UNIQUE INDEX `User_formatted_phone_number_key` ON `User`(`formatted_phone_number`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_user_type_id_fkey` FOREIGN KEY (`user_type_id`) REFERENCES `user_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
