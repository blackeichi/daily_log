import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { KisMarketDataService } from './kis-market-data.service';
import { StockCatalogService } from './stock-catalog.service';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';

@Module({
  controllers: [StocksController],
  providers: [
    StocksService,
    PrismaService,
    StockCatalogService,
    KisMarketDataService,
  ],
})
export class StocksModule {}
