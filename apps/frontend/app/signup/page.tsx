import { Metadata } from "next";
import { Suspense } from "react";
import { SignupUI } from "@/feature/auth/components/SignupUI";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <SignupUI />
    </Suspense>
  );
}
