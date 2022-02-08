/*
  Warnings:

  - You are about to drop the column `claimed` on the `tournament_prize` table. All the data in the column will be lost.
  - You are about to drop the column `dateClaimed` on the `tournament_prize` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Tournament` MODIFY `registration_closes` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `tournament_prize` DROP COLUMN `claimed`,
    DROP COLUMN `dateClaimed`;

-- CreateTable
CREATE TABLE `tournament_winner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentPrizeId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `dateClaimed` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_prize_claim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_winner_id` INTEGER NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `address_line_one` VARCHAR(191) NOT NULL,
    `address_line_two` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `eircode` VARCHAR(191) NULL,
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `dateSent` DATETIME(3) NULL,
    `delivered` BOOLEAN NOT NULL DEFAULT false,
    `dateDelivered` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tournament_prize_claim_tournament_winner_id_key`(`tournament_winner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_winner` ADD CONSTRAINT `tournament_winner_tournamentPrizeId_fkey` FOREIGN KEY (`tournamentPrizeId`) REFERENCES `tournament_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_winner` ADD CONSTRAINT `tournament_winner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_prize_claim` ADD CONSTRAINT `tournament_prize_claim_tournament_winner_id_fkey` FOREIGN KEY (`tournament_winner_id`) REFERENCES `tournament_winner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
