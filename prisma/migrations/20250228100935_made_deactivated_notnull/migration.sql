/*
  Warnings:

  - Made the column `deactivateAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "deactivateAt" SET NOT NULL;
