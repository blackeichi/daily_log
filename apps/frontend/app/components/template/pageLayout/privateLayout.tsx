"use client";

import { useEffect } from "react";
import MenuList from "./menuList";
import { GetMe } from "@/app/actions/client/user";
import { accessTokenAtom, userAtom } from "@/app/libs/atom";
import { useAtomValue, useSetAtom } from "jotai";

export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  const [{ data: userData }, onGetMe] = GetMe();
  const accessToken = useAtomValue(accessTokenAtom);
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (accessToken) {
      onGetMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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
