import { Metadata } from "next";
import { Suspense } from "react";
import moment from "moment";
import { backendFetch } from "@/lib/api/server";
import { GetLogsType } from "@/types/data";
import { LogUI } from "@/features/log/components/LogUI";

export const metadata: Metadata = {
  title: "로그",
};

export default async function LogPage() {
  const endDate = moment().format("YYYY-MM-DD");
  const startDate = moment().subtract(3, "months").format("YYYY-MM-DD");

  let initialData: GetLogsType[] | undefined;

  try {
    const params = new URLSearchParams({ startDate, endDate });
    const { data } = await backendFetch<GetLogsType[]>(
      `/log/all?${params.toString()}`,
    );
    initialData = data;
  } catch {}

  return (
    <div className="h-full w-full">
      <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
        <LogUI {...(initialData !== undefined ? { initialData } : {})} />
      </Suspense>
    </div>
  );
}
