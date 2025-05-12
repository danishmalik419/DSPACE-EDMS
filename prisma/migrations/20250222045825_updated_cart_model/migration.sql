/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Cart` table. All the data in the column will be lost.
  - Added the required column `isAccepted` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSubmitted` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewedAt` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewedBy` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedAt` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "createdAt",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAccepted" BOOLEAN NOT NULL,
ADD COLUMN     "isSubmitted" BOOLEAN NOT NULL,
ADD COLUMN     "reviewedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "reviewedBy" TEXT NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL;
