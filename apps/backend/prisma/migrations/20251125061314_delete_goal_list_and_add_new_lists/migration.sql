/*
  Warnings:

  - You are about to drop the column `goalList` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Todo" DROP COLUMN "goalList",
ADD COLUMN     "monthList" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "weekList" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "yearList" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "todayList" SET DEFAULT '[]',
ALTER COLUMN "breakLimitList" SET DEFAULT '[]';
