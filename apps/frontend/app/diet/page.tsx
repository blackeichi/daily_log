import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const DietUI = dynamic(() => import("./DietUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "다이어트",
};

export default function DietPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <DietUI />
    </Suspense>
  );
}
