/*
  Warnings:

  - Added the required column `position` to the `daily_prize` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_prize` ADD COLUMN `position` INTEGER NOT NULL;
