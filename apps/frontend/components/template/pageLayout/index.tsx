"use client";

import { PrivateLayout } from "./privateLayout";
import { usePathname } from "next/navigation";
import { ROUTE } from "@/constants/routes";
import Modal from "../../organisms/modal";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === ROUTE.LOGIN || pathname === ROUTE.SIGNUP;

  return (
    <div className="w-full h-full overflow-y-scroll">
      <Modal />
      {isAuthPage ? (
        <main id="main-content">{children}</main>
      ) : (
        <PrivateLayout>{children}</PrivateLayout>
      )}
    </div>
  );
};
