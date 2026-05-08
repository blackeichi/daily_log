import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { backendFetch } from "@/lib/api/server";
import { Routine } from "@/types/api";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";

const RoutineUI = dynamic(
  () => import("@/features/routine/components/RoutineUI"),
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
      <ErrorBoundaryProvider>
        <RoutineUI {...(initialData !== undefined ? { initialData } : {})} />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
