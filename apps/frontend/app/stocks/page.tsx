import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { backendFetch } from "@/lib/api/server";
import type { StockWatchlistResponse } from "@/types/api";

const StocksUI = dynamic(
  () => import("@/features/stocks/components/StocksUI"),
  {
    loading: () => <div className="h-full w-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "52주 고점 대비",
};

export default async function StocksPage() {
  let initialData: StockWatchlistResponse | undefined;

  try {
    const { data } = await backendFetch<StockWatchlistResponse>("/stocks");
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <StocksUI {...(initialData !== undefined ? { initialData } : {})} />
    </Suspense>
  );
}
