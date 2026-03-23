import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const EnglishUI = dynamic(() => import("./EnglishUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "영어 학습",
};

export default function EnglishPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <EnglishUI />
    </Suspense>
  );
}
