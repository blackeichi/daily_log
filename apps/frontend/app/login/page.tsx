import { Metadata } from "next";
import { Suspense } from "react";
import { LoginUI } from "@/feature/auth/components/LoginUI";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <LoginUI />
    </Suspense>
  );
}
