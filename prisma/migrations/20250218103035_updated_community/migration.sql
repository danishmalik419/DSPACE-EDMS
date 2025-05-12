/*
  Warnings:

  - You are about to drop the column `description` on the `Community` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Community" DROP COLUMN "description",
ADD COLUMN     "copyrightText" TEXT,
ADD COLUMN     "introductoryText" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "news" TEXT,
ADD COLUMN     "shortDescription" TEXT;
