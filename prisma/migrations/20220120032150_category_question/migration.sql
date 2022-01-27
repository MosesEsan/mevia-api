-- AlterTable
ALTER TABLE `Question` ADD COLUMN `categoryId` INTEGER NULL;

-- CreateTable
CREATE TABLE `question_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `question_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `question_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
