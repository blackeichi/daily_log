import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { backendFetch } from "@/lib/api/server";
import { GetAllCalories } from "@/types/data";

const DietUI = dynamic(() => import("./DietUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "다이어트",
};

function getCurrentMonthRange(): [string, string] {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  return [format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")];
}

export default async function DietPage() {
  const initialDateRange = getCurrentMonthRange();
  let initialData: GetAllCalories[] | undefined;
  try {
    const [startDate, endDate] = initialDateRange;
    const { data } = await backendFetch<GetAllCalories[]>(
      `/calories/all?startDate=${startDate}&endDate=${endDate}`,
    );
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <DietUI
        {...(initialData !== undefined ? { initialData } : {})}
        initialDateRange={initialDateRange}
      />
    </Suspense>
  );
}
