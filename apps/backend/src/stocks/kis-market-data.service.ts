import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type StockQuote = {
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  week52High: number;
  week52HighDate: string;
  drawdownPercent: number;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number | string;
  error_description?: string;
};

type QuoteResponse = {
  rt_cd?: string;
  msg_cd?: string;
  msg1?: string;
  output?: {
    stck_prpr?: string;
    prdy_vrss?: string;
    prdy_ctrt?: string;
    w52_hgpr?: string;
    w52_hgpr_date?: string;
  };
};

type CachedQuote = {
  expiresAt: number;
  quote: StockQuote;
};

type QuoteAttempt = {
  quote: StockQuote | null;
  message?: string;
  rateLimited: boolean;
};

@Injectable()
export class KisMarketDataService {
  private accessToken: { value: string; expiresAt: number } | undefined;
  private tokenPromise: Promise<string> | undefined;
  private readonly quoteCache = new Map<string, CachedQuote>();
  private readonly quotePromises = new Map<string, Promise<StockQuote>>();
  private quoteQueue: Promise<void> = Promise.resolve();
  private lastQuoteRequestAt = 0;

  constructor(private readonly configService: ConfigService) {}

  isConfigured() {
    return Boolean(this.appKey && this.appSecret);
  }

  async getQuote(symbol: string, forceRefresh = false) {
    const cached = this.quoteCache.get(symbol);
    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return cached.quote;
    }

    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        '한국투자증권 API 설정이 필요합니다.',
      );
    }

    const pendingQuote = this.quotePromises.get(symbol);
    if (pendingQuote) {
      return pendingQuote;
    }

    const quotePromise = this.enqueueQuoteRequest(() =>
      this.fetchQuoteWithRetry(symbol),
    );
    this.quotePromises.set(symbol, quotePromise);

    try {
      const quote = await quotePromise;
      this.quoteCache.set(symbol, {
        expiresAt: Date.now() + this.quoteCacheMs,
        quote,
      });
      return quote;
    } finally {
      if (this.quotePromises.get(symbol) === quotePromise) {
        this.quotePromises.delete(symbol);
      }
    }
  }

  private enqueueQuoteRequest<T>(request: () => Promise<T>) {
    const result = this.quoteQueue.then(request);

    this.quoteQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async fetchQuoteWithRetry(symbol: string) {
    for (let attempt = 0; attempt <= this.quoteRateLimitRetries; attempt += 1) {
      await this.waitForQuoteRequestSlot();
      const result = await this.fetchQuote(symbol);
      if (result.quote) {
        return result.quote;
      }

      if (!result.rateLimited || attempt === this.quoteRateLimitRetries) {
        throw new ServiceUnavailableException(
          result.message || `${symbol} 시세를 불러오지 못했습니다.`,
        );
      }

      await this.sleep(750 * 2 ** attempt);
    }

    throw new ServiceUnavailableException(
      `${symbol} 시세를 불러오지 못했습니다.`,
    );
  }

  private async waitForQuoteRequestSlot() {
    const elapsed = Date.now() - this.lastQuoteRequestAt;
    const waitMs = Math.max(0, this.quoteRequestIntervalMs - elapsed);
    if (waitMs > 0) {
      await this.sleep(waitMs);
    }
    this.lastQuoteRequestAt = Date.now();
  }

  private async fetchQuote(symbol: string): Promise<QuoteAttempt> {
    const token = await this.getAccessToken();
    const url = new URL(
      '/uapi/domestic-stock/v1/quotations/inquire-price',
      this.baseUrl,
    );
    url.searchParams.set('FID_COND_MRKT_DIV_CODE', 'J');
    url.searchParams.set('FID_INPUT_ISCD', symbol);

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: this.appKey,
        appsecret: this.appSecret,
        tr_id: 'FHKST01010100',
        custtype: 'P',
      },
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await response.json()) as QuoteResponse;

    if (!response.ok || data.rt_cd !== '0' || !data.output) {
      return {
        quote: null,
        message: data.msg1,
        rateLimited:
          data.msg_cd === 'EGW00201' ||
          data.msg1?.includes('초당 거래건수') === true,
      };
    }

    const currentPrice = this.toNumber(data.output.stck_prpr);
    const week52High = this.toNumber(data.output.w52_hgpr);
    const drawdownPercent =
      week52High > 0
        ? Math.max(0, ((week52High - currentPrice) / week52High) * 100)
        : 0;

    return {
      quote: {
        currentPrice,
        changeAmount: this.toNumber(data.output.prdy_vrss),
        changePercent: this.toNumber(data.output.prdy_ctrt),
        week52High,
        week52HighDate: data.output.w52_hgpr_date || '',
        drawdownPercent,
      },
      message: data.msg1,
      rateLimited: false,
    };
  }

  private async getAccessToken() {
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) {
      return this.accessToken.value;
    }

    if (!this.tokenPromise) {
      this.tokenPromise = this.issueAccessToken();
    }

    try {
      return await this.tokenPromise;
    } finally {
      this.tokenPromise = undefined;
    }
  }

  private async issueAccessToken() {
    const response = await fetch(new URL('/oauth2/tokenP', this.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: this.appKey,
        appsecret: this.appSecret,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await response.json()) as TokenResponse;

    if (!response.ok || !data.access_token) {
      throw new ServiceUnavailableException(
        data.error_description ||
          '한국투자증권 접근 토큰을 발급하지 못했습니다.',
      );
    }

    const expiresIn = Number(data.expires_in) || 86_400;
    this.accessToken = {
      value: data.access_token,
      expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
    };
    return data.access_token;
  }

  private toNumber(value?: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private get appKey() {
    return this.configService.get<string>('KIS_APP_KEY', '').trim();
  }

  private get appSecret() {
    return this.configService.get<string>('KIS_APP_SECRET', '').trim();
  }

  private get baseUrl() {
    return this.configService.get<string>(
      'KIS_API_BASE_URL',
      'https://openapi.koreainvestment.com:9443',
    );
  }

  private get quoteCacheMs() {
    return this.configService.get<number>('KIS_QUOTE_CACHE_MS', 60_000);
  }

  private get quoteRequestIntervalMs() {
    return this.configService.get<number>(
      'KIS_QUOTE_REQUEST_INTERVAL_MS',
      550,
    );
  }

  private get quoteRateLimitRetries() {
    return this.configService.get<number>('KIS_QUOTE_RATE_LIMIT_RETRIES', 3);
  }
}
