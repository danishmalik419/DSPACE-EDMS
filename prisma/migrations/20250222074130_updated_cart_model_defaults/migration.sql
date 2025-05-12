/*
  Warnings:

  - Made the column `isAccepted` on table `Cart` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isSubmitted` on table `Cart` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "isAccepted" SET NOT NULL,
ALTER COLUMN "isAccepted" SET DEFAULT false,
ALTER COLUMN "isSubmitted" SET NOT NULL,
ALTER COLUMN "isSubmitted" SET DEFAULT false;
