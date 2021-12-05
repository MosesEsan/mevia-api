-- AlterTable
ALTER TABLE `Prize` ADD COLUMN `available` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `user_type_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Prize` ADD CONSTRAINT `Prize_user_type_id_fkey` FOREIGN KEY (`user_type_id`) REFERENCES `user_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
