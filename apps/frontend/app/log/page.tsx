import { Metadata } from "next";
import { Suspense } from "react";
import { LogUI } from "./logUI";

export const metadata: Metadata = {
  title: "로그",
};

export default function LogPage() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
        <LogUI />
      </Suspense>
    </div>
  );
}
