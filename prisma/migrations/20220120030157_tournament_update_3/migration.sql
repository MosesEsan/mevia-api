/*
  Warnings:

  - You are about to drop the column `bonus_points` on the `Mode` table. All the data in the column will be lost.
  - You are about to drop the column `no_of_questions` on the `Mode` table. All the data in the column will be lost.
  - You are about to drop the column `mode_id` on the `tournament_mode` table. All the data in the column will be lost.
  - You are about to drop the column `tournament_id` on the `tournament_user` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tournament_user` table. All the data in the column will be lost.
  - Added the required column `bonus` to the `tournament_mode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `easy` to the `tournament_mode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hard` to the `tournament_mode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intermediate` to the `tournament_mode` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `tournament_mode` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tournamentId` to the `tournament_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `tournament_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tournament_mode` DROP FOREIGN KEY `tournament_mode_mode_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_user` DROP FOREIGN KEY `tournament_user_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `tournament_user` DROP FOREIGN KEY `tournament_user_user_id_fkey`;

-- DropIndex
DROP INDEX `tournament_mode_name_key` ON `tournament_mode`;

-- AlterTable
ALTER TABLE `Mode` DROP COLUMN `bonus_points`,
    DROP COLUMN `no_of_questions`,
    MODIFY `easy` INTEGER NOT NULL,
    MODIFY `intermediate` INTEGER NOT NULL,
    MODIFY `hard` INTEGER NOT NULL,
    MODIFY `bonus` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tournament_mode` DROP COLUMN `mode_id`,
    ADD COLUMN `bonus` INTEGER NOT NULL,
    ADD COLUMN `easy` INTEGER NOT NULL,
    ADD COLUMN `hard` INTEGER NOT NULL,
    ADD COLUMN `intermediate` INTEGER NOT NULL,
    ADD COLUMN `modeId` INTEGER NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tournament_user` DROP COLUMN `tournament_id`,
    DROP COLUMN `user_id`,
    ADD COLUMN `tournamentId` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `tournament_mode` ADD CONSTRAINT `tournament_mode_modeId_fkey` FOREIGN KEY (`modeId`) REFERENCES `Mode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_user` ADD CONSTRAINT `tournament_user_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_user` ADD CONSTRAINT `tournament_user_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
