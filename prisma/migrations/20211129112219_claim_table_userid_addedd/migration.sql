/*
  Warnings:

  - You are about to drop the column `userId` on the `PrizeClaim` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `PrizeClaim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `PrizeClaim` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PrizeClaim` DROP FOREIGN KEY `PrizeClaim_userId_fkey`;

-- AlterTable
ALTER TABLE `PrizeClaim` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PrizeClaim_user_id_key` ON `PrizeClaim`(`user_id`);

-- AddForeignKey
ALTER TABLE `PrizeClaim` ADD CONSTRAINT `PrizeClaim_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
