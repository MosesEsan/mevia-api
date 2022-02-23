-- AlterTable
ALTER TABLE `Ad` ADD COLUMN `active` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Tournament` ADD COLUMN `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `full_name` VARCHAR(191) NULL;
