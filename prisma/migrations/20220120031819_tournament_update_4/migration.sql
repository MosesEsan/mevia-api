/*
  Warnings:

  - You are about to drop the column `modeId` on the `tournament_mode` table. All the data in the column will be lost.
  - You are about to drop the `Mode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tournament_mode` DROP FOREIGN KEY `tournament_mode_modeId_fkey`;

-- AlterTable
ALTER TABLE `tournament_mode` DROP COLUMN `modeId`;

-- DropTable
DROP TABLE `Mode`;
