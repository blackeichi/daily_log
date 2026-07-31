import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { backendFetch } from "@/lib/api/server";
import type { Budget } from "@/types/api";

const BudgetUI = dynamic(() => import("@/features/budget/components/BudgetUI"), {
  loading: () => <div className="h-full w-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "고정지출",
};

export default async function BudgetPage() {
  let initialData: Budget | undefined;
  try {
    const { data } = await backendFetch<Budget>("/budget");
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <BudgetUI {...(initialData ? { initialData } : {})} />
    </Suspense>
  );
}
