-- AlterTable
ALTER TABLE `users` ADD COLUMN `apiTokenHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_apiTokenHash_key` ON `users`(`apiTokenHash`);

