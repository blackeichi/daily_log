import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const HomeUI = dynamic(() => import("./homeUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "홈",
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <HomeUI />
    </Suspense>
  );
}
