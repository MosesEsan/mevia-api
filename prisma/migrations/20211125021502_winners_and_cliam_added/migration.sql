-- CreateTable
CREATE TABLE `Winner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `daily_prize_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Winner_daily_prize_id_key`(`daily_prize_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrizeClaim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `winnerId` INTEGER NOT NULL,
    `daily_prize_id` INTEGER NOT NULL,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `delivered` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PrizeClaim_winnerId_key`(`winnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Winner` ADD CONSTRAINT `Winner_daily_prize_id_fkey` FOREIGN KEY (`daily_prize_id`) REFERENCES `daily_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `Winner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_daily_prize_id_fkey` FOREIGN KEY (`daily_prize_id`) REFERENCES `daily_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
