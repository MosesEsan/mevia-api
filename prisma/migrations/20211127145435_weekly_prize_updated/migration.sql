-- AlterTable
ALTER TABLE `weekly_prize` ADD COLUMN `winner` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `weekly_prize` ADD CONSTRAINT `weekly_prize_winner_fkey` FOREIGN KEY (`winner`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
