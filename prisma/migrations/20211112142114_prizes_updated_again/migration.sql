-- DropForeignKey
ALTER TABLE `daily_prize` DROP FOREIGN KEY `daily_prize_prizeId_fkey`;

-- AlterTable
ALTER TABLE `daily_prize` ADD COLUMN `questionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `daily_prize` ADD CONSTRAINT `daily_prize_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `Prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_prize` ADD CONSTRAINT `daily_prize_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
