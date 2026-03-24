"use client";

import { useEffect } from "react";
import MenuList from "./menuList";
import { useMe } from "@/app/libs/hooks/useUser";
import { userAtom } from "@/app/libs/atom";
import { useSetAtom } from "jotai";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: userData } = useMe();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  return (
    <div className="w-full min-h-full py-24 relative flex flex-col items-center">
      <MenuList />
      <div className="w-full min-h-full max-w-5xl px-3 text-xs sm:text-base flex justify-center">
        {children}
      </div>
    </div>
  );
};
