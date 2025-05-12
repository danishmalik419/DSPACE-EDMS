/*
  Warnings:

  - You are about to drop the column `abstract` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `citation` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfIssue` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `identifiers` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `otherTitles` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `seriesReports` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `sponsors` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `subjectKeywords` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `types` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "abstract",
DROP COLUMN "citation",
DROP COLUMN "dateOfIssue",
DROP COLUMN "description",
DROP COLUMN "files",
DROP COLUMN "identifiers",
DROP COLUMN "otherTitles",
DROP COLUMN "publisher",
DROP COLUMN "seriesReports",
DROP COLUMN "sponsors",
DROP COLUMN "subjectKeywords",
DROP COLUMN "thumbnail",
DROP COLUMN "types",
ADD COLUMN     "accNo" TEXT,
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "coverage" TEXT,
ADD COLUMN     "custodian" TEXT,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "donationDate" TIMESTAMP(3),
ADD COLUMN     "donor" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "extent" TEXT,
ADD COLUMN     "file" TEXT,
ADD COLUMN     "fileNo" TEXT,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "identifier" TEXT,
ADD COLUMN     "isPayable" BOOLEAN DEFAULT false,
ADD COLUMN     "keyword" TEXT,
ADD COLUMN     "place" TEXT,
ADD COLUMN     "relation" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "rights" TEXT,
ADD COLUMN     "sourceLink" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "volume" TEXT,
ALTER COLUMN "licenseConfirmed" SET DEFAULT true;
