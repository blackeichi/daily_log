import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { backendFetch } from "@/lib/api/server";
import { GetAllOverallT } from "@/types/data";

const HomeUI = dynamic(() => import("./homeUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "홈",
};

function getCurrentMonthRange(): [string, string] {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  return [format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")];
}

export default async function HomePage() {
  const initialDateRange = getCurrentMonthRange();
  let initialData: GetAllOverallT[] | undefined;
  try {
    const [startDate, endDate] = initialDateRange;
    const { data } = await backendFetch<GetAllOverallT[]>(
      `/overall/all?startDate=${startDate}&endDate=${endDate}`,
    );
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <HomeUI
        {...(initialData !== undefined ? { initialData } : {})}
        initialDateRange={initialDateRange}
      />
    </Suspense>
  );
}
