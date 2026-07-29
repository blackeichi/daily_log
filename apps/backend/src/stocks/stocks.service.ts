import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateStockWatchlistDto } from './dto/update-stock-watchlist.dto';
import { KisMarketDataService, StockQuote } from './kis-market-data.service';
import { StockCatalogService } from './stock-catalog.service';

type WatchlistRecord = {
  id: number;
  symbol: string;
  name: string;
  market: string;
  position: number;
};

export type StockWatchlistItemResponse = WatchlistRecord & {
  quote: StockQuote | null;
  quoteError?: string;
};

@Injectable()
export class StocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: StockCatalogService,
    private readonly marketDataService: KisMarketDataService,
  ) {}

  async getWatchlist(userId: number, forceRefresh = false) {
    const records = await this.prisma.stockWatchlistItem.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        symbol: true,
        name: true,
        market: true,
        position: true,
      },
    });

    if (!this.marketDataService.isConfigured()) {
      return {
        items: records.map((record) => ({
          ...record,
          quote: null,
          quoteError: '한국투자증권 API 설정이 필요합니다.',
        })),
        marketDataStatus: 'unconfigured' as const,
        updatedAt: new Date().toISOString(),
      };
    }

    const items: StockWatchlistItemResponse[] = [];
    for (let index = 0; index < records.length; index += 4) {
      const chunk = records.slice(index, index + 4);
      const chunkItems = await Promise.all(
        chunk.map(async (record) => {
          try {
            const quote = await this.marketDataService.getQuote(
              record.symbol,
              forceRefresh,
            );
            return { ...record, quote };
          } catch (error) {
            return {
              ...record,
              quote: null,
              quoteError:
                error instanceof Error
                  ? error.message
                  : '시세를 불러오지 못했습니다.',
            };
          }
        }),
      );
      items.push(...chunkItems);
    }

    return {
      items,
      marketDataStatus: items.some((item) => !item.quote)
        ? ('partial' as const)
        : ('ready' as const),
      updatedAt: new Date().toISOString(),
    };
  }

  search(query: string) {
    return this.catalogService.search(query);
  }

  async updateWatchlist(userId: number, dto: UpdateStockWatchlistDto) {
    const catalogItems = await this.catalogService.findBySymbols(dto.symbols);

    await this.prisma.$transaction(async (transaction) => {
      await transaction.stockWatchlistItem.deleteMany({
        where: { userId },
      });

      if (catalogItems.length > 0) {
        await transaction.stockWatchlistItem.createMany({
          data: catalogItems.map((item, position) => ({
            userId,
            symbol: item.symbol,
            name: item.name,
            market: item.market,
            position,
          })),
        });
      }
    });

    return this.getWatchlist(userId);
  }
}
