import { Metadata } from "next";
import { Suspense } from "react";
import { LogUI } from "./logUI";
import { backendFetch } from "@/app/libs/api/server";
import { GetLogsType } from "@/app/types/data";
import moment from "moment";

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
    <div className="w-full h-full">
      <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
        <LogUI {...(initialData !== undefined ? { initialData } : {})} />
      </Suspense>
    </div>
  );
}
