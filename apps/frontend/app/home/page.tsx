import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { backendFetch } from "@/lib/api/server";

const HomeUI = dynamic(() => import("../../features/home/components/HomeUi"), {
  loading: () => <div className="w-full h-full bg-stone-100" />,
});

export const metadata: Metadata = {
  title: "홈",
};

export default async function HomePage() {
  let initialData: string | undefined;
  try {
    const { data } = await backendFetch<string>(`/users/ai-conversation`);
    initialData = data;
  } catch {}

  return (
    <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
      <HomeUI {...(initialData !== undefined ? { initialData } : {})} />
    </Suspense>
  );
}
