/*
  Warnings:

  - Added the required column `createdById` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfIssue` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_collectionId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "abstract" TEXT,
ADD COLUMN     "authors" TEXT[],
ADD COLUMN     "citation" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "dateOfIssue" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "identifiers" JSONB,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "licenseConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otherTitles" TEXT[],
ADD COLUMN     "publisher" TEXT,
ADD COLUMN     "seriesReports" JSONB,
ADD COLUMN     "sponsors" TEXT,
ADD COLUMN     "subjectKeywords" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "types" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
