"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const defaultHome = localStorage.getItem("defaultHome") || "/home";
    router.replace(defaultHome);
  }, [router]);

  return <div className="w-full h-full bg-stone-100" />;
}
