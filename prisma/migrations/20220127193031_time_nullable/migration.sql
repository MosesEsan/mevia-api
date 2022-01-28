/*
  Warnings:

  - Added the required column `registration_closes` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Tournament` ADD COLUMN `registration_closes` DATE NOT NULL;

-- AlterTable
ALTER TABLE `tournament_question` ADD COLUMN `time` INTEGER NULL;
