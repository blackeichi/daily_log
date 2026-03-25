import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { backendFetch } from "@/app/libs/api/server";
import { GetTodosType } from "@/app/types/api";

const TodoUI = dynamic(
  () => import("./todoUI").then((mod) => ({ default: mod.TodoUI })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);
const ErrorBoundaryProvider = dynamic(
  () =>
    import("@/app/components/providers/ErrorBoundaryProvider").then((mod) => ({
      default: mod.ErrorBoundaryProvider,
    })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "투두 리스트",
};

export default async function TodoPage() {
  let initialData: GetTodosType | undefined;
  try {
    const { data } = await backendFetch<GetTodosType>("/todos");
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <ErrorBoundaryProvider>
        <TodoUI {...(initialData !== undefined ? { initialData } : {})} />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
