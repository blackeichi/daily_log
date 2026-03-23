"use client";

import { PrivateLayout } from "./privateLayout";
import { usePathname } from "next/navigation";
import { ROUTE } from "@/app/constants/routes";
import Modal from "../../organisms/modal";
import { TokenRefreshProvider } from "../../providers/TokenRefreshProvider";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <div className="w-full h-full overflow-y-scroll">
      <Modal />
      {pathname === ROUTE.LOGIN || pathname === ROUTE.SIGNUP ? (
        <>{children}</>
      ) : (
        <TokenRefreshProvider>
          <PrivateLayout>{children}</PrivateLayout>
        </TokenRefreshProvider>
      )}
    </div>
  );
};
