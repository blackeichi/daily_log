import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoginUI = dynamic(
  () => import("./ui").then((mod) => ({ default: mod.LoginUI })),
  {
    loading: () => <div className="w-full h-full bg-stone-100" />,
  },
);

export const metadata: Metadata = {
  title: "로그인",
};

export default function Login() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <LoginUI />
    </Suspense>
  );
}
