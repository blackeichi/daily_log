/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."UseAiCount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UseAiCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UseAiCount_userId_key" ON "public"."UseAiCount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Todo_userId_key" ON "public"."Todo"("userId");

-- AddForeignKey
ALTER TABLE "public"."UseAiCount" ADD CONSTRAINT "UseAiCount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
