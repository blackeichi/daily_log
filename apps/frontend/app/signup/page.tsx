import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SignUpUI = dynamic(
  () => import("./ui").then((mod) => ({ default: mod.SignUpUI })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <SignUpUI />
    </Suspense>
  );
}
