import { LoginUI } from "@/features/auth/components/LoginUI";
import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <ErrorBoundaryProvider>
        <LoginUI />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
