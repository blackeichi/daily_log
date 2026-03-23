import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

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

export default function TodoPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <ErrorBoundaryProvider>
        <TodoUI />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
