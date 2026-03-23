"use client";

import {
  SnackbarProvider as NotistackProvider,
  useSnackbar,
  type SnackbarKey,
} from "notistack";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { alertAtom, confirmAtom, errorAtom } from "@/app/libs/atom";
import Button from "../atoms/button";
import Overlay from "../atoms/overlay";

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotistackProvider
      maxSnack={4}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      style={{ marginTop: "6vh" }}
    >
      <SnackbarManager />
      {children}
    </NotistackProvider>
  );
}

const SnackbarManager = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [error, setError] = useAtom(errorAtom);
  const [alertMsg, setAlertMsg] = useAtom(alertAtom);
  const [confirmMsg, setConfirmMsg] = useAtom(confirmAtom);

  const action = (snackbarId: SnackbarKey) => (
    <Button
      onClick={() => {
        closeSnackbar(snackbarId);
      }}
      text="확인"
      height={30}
      width={50}
      style={{
        outline: "none",
        backgroundColor: "transparent",
      }}
    />
  );

  useEffect(() => {
    if (alertMsg) {
      enqueueSnackbar(alertMsg, {
        variant: "info",
        action,
      });
      setAlertMsg(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertMsg]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, {
        variant: "error",
        action,
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <Overlay
      isOpen={!!confirmMsg}
      onClick={() => setConfirmMsg(null)}
      zIndex={100}
    >
      <div className="flex flex-col gap-4 p-8 w-[80vw] sm:w-[400px] text-xs sm:text-sm">
        <div className="flex flex-col gap-4">
          {confirmMsg?.title && (
            <h1 className="text-lg sm:text-xl font-bold">
              {confirmMsg?.title}
            </h1>
          )}
        </div>
        <p className="whitespace-pre-line">{confirmMsg?.message}</p>
        <div className="flex justify-end gap-2 pt-6">
          <Button
            text="확인"
            onClick={() => {
              confirmMsg?.confirmEvent();
              setConfirmMsg(null);
            }}
            width={70}
            height={40}
          />
          <Button
            text="취소"
            contained={false}
            onClick={() => {
              setConfirmMsg(null);
            }}
            width={70}
            height={40}
          />
        </div>
      </div>
    </Overlay>
  );
};
