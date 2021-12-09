/*
  Warnings:

  - You are about to drop the column `choices` on the `Question` table. All the data in the column will be lost.
  - Made the column `choice_four` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `choice_one` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `choice_three` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `choice_two` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Question` DROP COLUMN `choices`,
    MODIFY `choice_four` TEXT NOT NULL,
    MODIFY `choice_one` TEXT NOT NULL,
    MODIFY `choice_three` TEXT NOT NULL,
    MODIFY `choice_two` TEXT NOT NULL;
