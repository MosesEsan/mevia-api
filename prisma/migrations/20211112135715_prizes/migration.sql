-- CreateTable
CREATE TABLE `Prize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_prize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prizeId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDatDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `daily_prize` ADD CONSTRAINT `daily_prize_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
