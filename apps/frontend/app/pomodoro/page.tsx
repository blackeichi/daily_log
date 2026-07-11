import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";

const PomodoroUI = dynamic(
  () => import("@/features/pomodoro/components/PomodoroUI"),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "포모도로",
};

export default function PomodoroPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <ErrorBoundaryProvider>
        <PomodoroUI />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
