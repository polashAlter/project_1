/*
  Warnings:

  - You are about to drop the column `socialLogIn` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "socialLogIn",
ADD COLUMN     "authProvider" TEXT DEFAULT 'own';
