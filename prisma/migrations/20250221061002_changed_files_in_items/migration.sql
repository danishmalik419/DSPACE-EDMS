/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_itemId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "files" TEXT[];

-- DropTable
DROP TABLE "File";
