"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/hooks/useUser";
import { userAtom } from "@/lib/atom";
import { useSetAtom } from "jotai";
import MenuList from "../molecules/menuList";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: userData } = useMe();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  return (
    <div className="w-full min-h-full py-24 sm:pb-10 pb-5 relative flex flex-col items-center">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-stone-800 focus:shadow"
      >
        본문으로 바로가기
      </a>
      <MenuList />
      <main
        id="main-content"
        className="w-full min-h-full max-w-5xl px-3 text-xs sm:text-base flex justify-center"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
};
