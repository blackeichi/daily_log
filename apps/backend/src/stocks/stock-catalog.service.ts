import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import AdmZip from 'adm-zip';

export type StockMarket = 'KOSPI' | 'KOSDAQ';

export type StockCatalogItem = {
  symbol: string;
  name: string;
  market: StockMarket;
};

type MasterSource = {
  market: StockMarket;
  url: string;
  suffixLength: number;
};

const MASTER_CACHE_MS = 24 * 60 * 60 * 1000;
const MASTER_SOURCES: MasterSource[] = [
  {
    market: 'KOSPI',
    url: 'https://new.real.download.dws.co.kr/common/master/kospi_code.mst.zip',
    suffixLength: 228,
  },
  {
    market: 'KOSDAQ',
    url: 'https://new.real.download.dws.co.kr/common/master/kosdaq_code.mst.zip',
    suffixLength: 222,
  },
];

@Injectable()
export class StockCatalogService {
  private cachedCatalog:
    | { expiresAt: number; items: StockCatalogItem[] }
    | undefined;
  private catalogPromise: Promise<StockCatalogItem[]> | undefined;

  async search(query: string): Promise<StockCatalogItem[]> {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    if (!normalizedQuery) return [];

    const compactQuery = normalizedQuery.replace(/\s/g, '');
    const catalog = await this.getCatalog();

    return catalog
      .filter((item) => {
        const compactName = item.name
          .toLocaleLowerCase('ko-KR')
          .replace(/\s/g, '');
        return (
          item.symbol.includes(compactQuery) ||
          compactName.includes(compactQuery)
        );
      })
      .slice(0, 20);
  }

  async findBySymbols(symbols: string[]): Promise<StockCatalogItem[]> {
    const catalog = await this.getCatalog();
    const itemMap = new Map(catalog.map((item) => [item.symbol, item]));

    return symbols.map((symbol) => {
      const item = itemMap.get(symbol);
      if (!item) {
        throw new ServiceUnavailableException(
          `${symbol} 종목 정보를 확인할 수 없습니다.`,
        );
      }
      return item;
    });
  }

  private async getCatalog(): Promise<StockCatalogItem[]> {
    if (this.cachedCatalog && this.cachedCatalog.expiresAt > Date.now()) {
      return this.cachedCatalog.items;
    }

    if (!this.catalogPromise) {
      this.catalogPromise = this.loadCatalog();
    }

    try {
      return await this.catalogPromise;
    } finally {
      this.catalogPromise = undefined;
    }
  }

  private async loadCatalog(): Promise<StockCatalogItem[]> {
    try {
      const sourceItems = await Promise.all(
        MASTER_SOURCES.map((source) => this.loadMaster(source)),
      );
      const uniqueItems = new Map<string, StockCatalogItem>();

      sourceItems.flat().forEach((item) => {
        if (!uniqueItems.has(item.symbol)) {
          uniqueItems.set(item.symbol, item);
        }
      });

      const items = Array.from(uniqueItems.values());
      this.cachedCatalog = {
        expiresAt: Date.now() + MASTER_CACHE_MS,
        items,
      };
      return items;
    } catch {
      if (this.cachedCatalog) return this.cachedCatalog.items;
      throw new ServiceUnavailableException(
        '한국투자증권 종목 목록을 불러오지 못했습니다.',
      );
    }
  }

  private async loadMaster(source: MasterSource): Promise<StockCatalogItem[]> {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`Master download failed: ${response.status}`);
    }

    const zip = new AdmZip(Buffer.from(await response.arrayBuffer()));
    const entry = zip.getEntries().find((item) => !item.isDirectory);
    if (!entry) {
      throw new Error('Master archive is empty.');
    }

    const text = new TextDecoder('euc-kr').decode(entry.getData());
    return text
      .split(/\r?\n/)
      .map((row) => this.parseRow(row, source))
      .filter((item): item is StockCatalogItem => item !== null);
  }

  private parseRow(row: string, source: MasterSource): StockCatalogItem | null {
    if (row.length <= 21 + source.suffixLength) return null;

    const symbol = row.slice(0, 9).trim();
    const name = row.slice(21, -source.suffixLength).trim();

    if (!/^\d{6}$/.test(symbol) || !name) return null;
    return { symbol, name, market: source.market };
  }
}
