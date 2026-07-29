-- CreateTable
CREATE TABLE "StockWatchlistItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symbol" VARCHAR(6) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "market" VARCHAR(10) NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockWatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockWatchlistItem_userId_position_idx" ON "StockWatchlistItem"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StockWatchlistItem_userId_symbol_key" ON "StockWatchlistItem"("userId", "symbol");

-- AddForeignKey
ALTER TABLE "StockWatchlistItem" ADD CONSTRAINT "StockWatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
