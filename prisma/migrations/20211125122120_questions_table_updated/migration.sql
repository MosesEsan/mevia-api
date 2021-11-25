/*
  Warnings:

  - A unique constraint covering the columns `[choice_one]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[choice_two]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[choice_three]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[choice_four]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Question` ADD COLUMN `choice_four` VARCHAR(191) NULL,
    ADD COLUMN `choice_one` VARCHAR(191) NULL,
    ADD COLUMN `choice_three` VARCHAR(191) NULL,
    ADD COLUMN `choice_two` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Question_choice_one_key` ON `Question`(`choice_one`);

-- CreateIndex
CREATE UNIQUE INDEX `Question_choice_two_key` ON `Question`(`choice_two`);

-- CreateIndex
CREATE UNIQUE INDEX `Question_choice_three_key` ON `Question`(`choice_three`);

-- CreateIndex
CREATE UNIQUE INDEX `Question_choice_four_key` ON `Question`(`choice_four`);
