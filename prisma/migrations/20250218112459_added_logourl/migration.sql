/*
  Warnings:

  - You are about to drop the column `logo` on the `Community` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Community" DROP COLUMN "logo",
ADD COLUMN     "logoUrl" TEXT;
