/*
  Warnings:

  - Added the required column `name` to the `weekly_challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `weekly_challenge` ADD COLUMN `name` VARCHAR(191) NOT NULL;
