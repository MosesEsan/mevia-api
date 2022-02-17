-- CreateTable
CREATE TABLE `Brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `address_line_one` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `eircode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gift_card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NOT NULL,
    `tournamentPrizeId` INTEGER NULL,
    `value` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_card` ADD CONSTRAINT `gift_card_tournamentPrizeId_fkey` FOREIGN KEY (`tournamentPrizeId`) REFERENCES `tournament_prize`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
