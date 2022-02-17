-- CreateTable
CREATE TABLE `tournament_reward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentPrizeId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `dateClaimed` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_reward` ADD CONSTRAINT `tournament_reward_tournamentPrizeId_fkey` FOREIGN KEY (`tournamentPrizeId`) REFERENCES `tournament_prize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_reward` ADD CONSTRAINT `tournament_reward_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
