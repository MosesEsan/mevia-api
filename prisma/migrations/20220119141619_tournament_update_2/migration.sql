/*
  Warnings:

  - You are about to drop the `TournamentUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TournamentUser` DROP FOREIGN KEY `TournamentUser_tournament_id_fkey`;

-- DropForeignKey
ALTER TABLE `TournamentUser` DROP FOREIGN KEY `TournamentUser_userId_fkey`;

-- DropTable
DROP TABLE `TournamentUser`;

-- CreateTable
CREATE TABLE `tournament_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_user` ADD CONSTRAINT `tournament_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_user` ADD CONSTRAINT `tournament_user_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
