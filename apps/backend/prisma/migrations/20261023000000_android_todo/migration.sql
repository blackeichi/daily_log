ALTER TABLE "Todo" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;
CREATE TABLE "MobileSession" (
 "id" TEXT NOT NULL PRIMARY KEY, "userId" INTEGER NOT NULL,
 "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "MobileSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MobileSession_tokenHash_key" ON "MobileSession"("tokenHash");
CREATE INDEX "MobileSession_userId_idx" ON "MobileSession"("userId");
CREATE TABLE "TodoMutation" ("id" TEXT NOT NULL PRIMARY KEY, "userId" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "TodoMutation_userId_idx" ON "TodoMutation"("userId");
