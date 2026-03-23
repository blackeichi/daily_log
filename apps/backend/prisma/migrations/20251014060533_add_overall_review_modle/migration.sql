/*
  Warnings:

  - You are about to alter the column `memo` on the `Calorie` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `title` on the `Log` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "public"."Calorie" ALTER COLUMN "memo" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "public"."Log" ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "public"."OverallReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reviewDate" TEXT NOT NULL,
    "emotion" VARCHAR(50) NOT NULL,
    "memo" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverallReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OverallReview_userId_createdAt_idx" ON "public"."OverallReview"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OverallReview_userId_reviewDate_key" ON "public"."OverallReview"("userId", "reviewDate");

-- AddForeignKey
ALTER TABLE "public"."OverallReview" ADD CONSTRAINT "OverallReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
