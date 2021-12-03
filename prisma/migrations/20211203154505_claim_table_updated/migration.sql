/*
  Warnings:

  - You are about to drop the `PrizeClaim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_weekly_prize_id_fkey`;

-- DropTable
DROP TABLE `PrizeClaim`;

-- CreateTable
CREATE TABLE `prize_claim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weekly_prize_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `address_line_one` VARCHAR(191) NOT NULL,
    `address_line_two` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `eircode` VARCHAR(191) NULL,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `dateClaimed` DATETIME(3) NULL,
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `dateSent` DATETIME(3) NULL,
    `delivered` BOOLEAN NOT NULL DEFAULT false,
    `dateDelivered` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `prize_claim_weekly_prize_id_key`(`weekly_prize_id`),
    UNIQUE INDEX `prize_claim_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prize_claim` ADD CONSTRAINT `prize_claim_weekly_prize_id_fkey` FOREIGN KEY (`weekly_prize_id`) REFERENCES `weekly_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_claim` ADD CONSTRAINT `prize_claim_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
