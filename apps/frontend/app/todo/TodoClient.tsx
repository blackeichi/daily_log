"use client";

import dynamic from "next/dynamic";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";

const TodoUI = dynamic(() => import("@/features/todo/components/TodoUI"), {
  ssr: false,
  loading: () => null,
});

export default function TodoClient() {
  return (
    <ErrorBoundaryProvider>
      <TodoUI />
    </ErrorBoundaryProvider>
  );
}
