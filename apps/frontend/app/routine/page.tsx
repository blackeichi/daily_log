import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const RoutineUI = dynamic(
  () => import("./RoutineUI").then((mod) => ({ default: mod.RoutineUI })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "루틴",
};

const RoutinePage = () => {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <RoutineUI />
    </Suspense>
  );
};

export default RoutinePage;
