"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { FiRefreshCw } from "react-icons/fi";
import { MdEdit, MdOutlineShowChart } from "react-icons/md";
import Button from "@/components/atoms/button";
import { EmptyState } from "@/components/atoms/EmptyState";
import QueryRetry from "@/components/molecules/QueryRetry";
import { apiClient } from "@/lib/api/client";
import { errorAtom } from "@/lib/atom";
import { stockKeys, useStocks } from "@/lib/hooks/useStocks";
import type { StockWatchlistItem, StockWatchlistResponse } from "@/types/api";
import StockEditorModal from "./StockEditorModal";

const priceFormatter = new Intl.NumberFormat("ko-KR");

function formatDate(value: string) {
  if (!/^\d{8}$/.test(value)) return "";
  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6)}`;
}

function changeColor(value: number) {
  if (value > 0) return "text-red-700";
  if (value < 0) return "text-blue-700";
  return "text-stone-600";
}

function StockRow({ item }: { item: StockWatchlistItem }) {
  const quote = item.quote;

  return (
    <div className="border-b border-stone-200 bg-white px-3 py-4 last:border-b-0 sm:grid sm:grid-cols-[minmax(180px,1.4fr)_repeat(3,minmax(130px,1fr))] sm:items-center sm:gap-4 sm:px-4">
      <div className="mb-4 min-w-0 sm:mb-0">
        <p className="truncate text-sm font-semibold text-stone-900 sm:text-base">
          {item.name}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {item.symbol} · {item.market}
        </p>
      </div>

      {quote ? (
        <div className="grid grid-cols-3 gap-2 sm:contents">
          <div>
            <p className="text-[11px] text-stone-500 sm:hidden">현재가</p>
            <p className="mt-1 whitespace-nowrap text-sm font-semibold sm:mt-0">
              {priceFormatter.format(quote.currentPrice)}원
            </p>
            <p
              className={`mt-1 whitespace-nowrap text-xs ${changeColor(
                quote.changePercent,
              )}`}
            >
              {quote.changePercent > 0 ? "+" : ""}
              {quote.changePercent.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[11px] text-stone-500 sm:hidden">52주 최고가</p>
            <p className="mt-1 whitespace-nowrap text-sm sm:mt-0">
              {priceFormatter.format(quote.week52High)}원
            </p>
            <p className="mt-1 whitespace-nowrap text-xs text-stone-500">
              {formatDate(quote.week52HighDate)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-stone-500 sm:hidden">고점 대비</p>
            <p className="mt-1 whitespace-nowrap text-base font-bold text-blue-800 sm:mt-0">
              {quote.drawdownPercent.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-stone-500">하락</p>
          </div>
        </div>
      ) : (
        <div className="text-xs text-stone-500 sm:col-span-3">
          {item.quoteError || "시세를 불러오지 못했습니다."}
        </div>
      )}
    </div>
  );
}

export default function StocksUI({
  initialData,
}: {
  initialData?: StockWatchlistResponse;
}) {
  const queryClient = useQueryClient();
  const setError = useSetAtom(errorAtom);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, isLoading, isError, isFetching, refetch } = useStocks(
    initialData ? { initialData } : undefined,
  );

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const refreshed = await apiClient<StockWatchlistResponse>(
        "/stocks?refresh=true",
      );
      queryClient.setQueryData(stockKeys.watchlist(), refreshed);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "시세를 새로고침하지 못했습니다.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isError) {
    return (
      <div className="w-full max-w-[900px] pt-4">
        <QueryRetry
          message="관심 종목을 불러오지 못했습니다."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-4 pt-4">
      <header className="flex items-end justify-between border-b border-stone-300 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <MdOutlineShowChart
            className="shrink-0 text-stone-700"
            size={24}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-stone-900 sm:text-xl">
              52주 고점 대비
            </h1>
            <p className="mt-0.5 text-xs text-stone-500">국내주식 관심 종목</p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-stone-600 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500 disabled:cursor-wait disabled:text-stone-400"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="시세 새로고침"
          title="시세 새로고침"
        >
          <FiRefreshCw
            size={18}
            className={isRefreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />
        </button>
      </header>

      {data?.marketDataStatus === "unconfigured" && (
        <div
          className="border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="status"
        >
          한국투자증권 API 키를 설정하면 현재 시세가 표시됩니다.
        </div>
      )}
      {data?.marketDataStatus === "partial" && (
        <div
          className="border-l-4 border-stone-500 bg-white px-3 py-2 text-xs text-stone-600"
          role="status"
        >
          일부 종목의 시세를 불러오지 못했습니다.
        </div>
      )}

      <section className="overflow-hidden border border-stone-300">
        <div className="hidden grid-cols-[minmax(180px,1.4fr)_repeat(3,minmax(130px,1fr))] gap-4 bg-stone-700 px-4 py-3 text-xs font-medium text-white sm:grid">
          <span>종목</span>
          <span>현재가 / 등락률</span>
          <span>52주 최고가</span>
          <span>고점 대비 하락률</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-px bg-stone-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse bg-white sm:h-20" />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((item) => <StockRow key={item.symbol} item={item} />)
        ) : (
          <EmptyState
            title="저장된 관심 종목이 없습니다."
            description="편집 버튼에서 국내주식을 검색해 추가할 수 있습니다."
            className="min-h-40 rounded-none bg-white"
          />
        )}
      </section>

      <div className="flex justify-end pb-4">
        <Button
          text="편집"
          onClick={() => setIsEditorOpen(true)}
          icon={<MdEdit size={17} aria-hidden="true" />}
          height={40}
          width={110}
        />
      </div>

      {isEditorOpen && (
        <StockEditorModal
          initialItems={items}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
