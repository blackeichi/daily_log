import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { backendFetch } from "@/app/libs/api/server";
import { Routine } from "@/app/types/api";

const RoutineUI = dynamic(
  () => import("./RoutineUI").then((mod) => ({ default: mod.RoutineUI })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "루틴",
};

export default async function RoutinePage() {
  let initialData: Routine | undefined;
  try {
    const { data } = await backendFetch<Routine>("/routines");
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <RoutineUI {...(initialData !== undefined ? { initialData } : {})} />
    </Suspense>
  );
}
