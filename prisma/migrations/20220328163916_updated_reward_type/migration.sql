-- AlterTable
ALTER TABLE `reward_type` ADD COLUMN `addressRequired` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `emailRequired` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `message` VARCHAR(191) NULL,
    ADD COLUMN `subtitle` VARCHAR(191) NULL;
