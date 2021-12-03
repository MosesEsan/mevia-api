/*
  Warnings:

  - Added the required column `weekly_challenge_id` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Game` ADD COLUMN `weekly_challenge_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_weekly_challenge_id_fkey` FOREIGN KEY (`weekly_challenge_id`) REFERENCES `weekly_challenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
