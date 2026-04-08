/*
  Warnings:

  - You are about to drop the `OverallReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OverallReview" DROP CONSTRAINT "OverallReview_userId_fkey";

-- DropTable
DROP TABLE "OverallReview";
