/*
  Warnings:

  - You are about to drop the column `endDatDate` on the `daily_prize` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `daily_prize` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `daily_prize` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `daily_prize` DROP FOREIGN KEY `daily_prize_questionId_fkey`;

-- AlterTable
ALTER TABLE `daily_prize` DROP COLUMN `endDatDate`,
    DROP COLUMN `questionId`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL;
