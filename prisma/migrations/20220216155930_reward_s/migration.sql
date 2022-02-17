/*
  Warnings:

  - Added the required column `points` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Reward` ADD COLUMN `available` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `points` INTEGER NOT NULL,
    ADD COLUMN `user_type_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_user_type_id_fkey` FOREIGN KEY (`user_type_id`) REFERENCES `user_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
