/*
  Warnings:

  - You are about to drop the column `user_type_id` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `user_type_Id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userTypeId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userTypeId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userTypeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_user_type_id_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_user_type_Id_fkey`;

-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `user_type_id`,
    ADD COLUMN `userTypeId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `user_type_Id`,
    ADD COLUMN `userTypeId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Profile_userTypeId_key` ON `Profile`(`userTypeId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userTypeId_fkey` FOREIGN KEY (`userTypeId`) REFERENCES `user_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userTypeId_fkey` FOREIGN KEY (`userTypeId`) REFERENCES `user_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
