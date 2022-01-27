-- CreateTable
CREATE TABLE `tournament_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tournament_category` ADD CONSTRAINT `tournament_category_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_category` ADD CONSTRAINT `tournament_category_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `question_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
