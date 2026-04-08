import { Metadata } from "next";
import { Suspense } from "react";
/* 
import dynamic from "next/dynamic";
const EnglishUI = dynamic(() => import("./EnglishUI"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});
 */
export const metadata: Metadata = {
  title: "영어 학습 (임시 폐쇄)",
};

export default function EnglishPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      {/* <EnglishUI /> */}
    </Suspense>
  );
}
