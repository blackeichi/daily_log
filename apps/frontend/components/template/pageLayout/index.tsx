"use client";

import { PrivateLayout } from "./privateLayout";
import { usePathname } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import Modal from "../../organisms/modal";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="w-full h-full overflow-y-scroll">
      <Modal />
      {pathname === ROUTE.LOGIN || pathname === ROUTE.SIGNUP ? (
        <>{children}</>
      ) : (
        <PrivateLayout>{children}</PrivateLayout>
      )}
    </div>
  );
};
