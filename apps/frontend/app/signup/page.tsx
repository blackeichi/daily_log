import { SignupUI } from "@/features/auth/components/SignupUI";
import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-stone-100" />}>
      <ErrorBoundaryProvider>
        <SignupUI />
      </ErrorBoundaryProvider>
    </Suspense>
  );
}
