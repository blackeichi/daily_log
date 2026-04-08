/*
  Warnings:

  - You are about to drop the `UseAiCount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UseAiCount" DROP CONSTRAINT "UseAiCount_userId_fkey";

-- DropTable
DROP TABLE "UseAiCount";

-- CreateTable
CREATE TABLE "AiHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiHistory_userId_createdAt_idx" ON "AiHistory"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiHistory_userId_date_key" ON "AiHistory"("userId", "date");

-- AddForeignKey
ALTER TABLE "AiHistory" ADD CONSTRAINT "AiHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
