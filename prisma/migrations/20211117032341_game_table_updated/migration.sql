-- AlterTable
ALTER TABLE `Game` ADD COLUMN `correct_answers` INTEGER NULL,
    ADD COLUMN `skipped` INTEGER NULL,
    ADD COLUMN `wrong_answers` INTEGER NULL;
