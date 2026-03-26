import { sendChatMessage } from "@/actions/server/chat";
import { errorAtom, userAtom } from "@/lib/atom";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useTransition } from "react";
import { useAllData, useIncrementAiCount } from "@/lib/hooks/useUser";

export const GetAiAdvice = ({
  date,
  setIsPending,
  onGetAdvice,
  setToggleGetAdvice,
}: {
  date: string;
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
  onGetAdvice: (advice?: string) => void;
  setToggleGetAdvice: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data, isError } = useAllData(date);

  useEffect(() => {
    if (isError) {
      setIsPending(false);
      onGetAdvice();
    }
  }, [isError, setIsPending, onGetAdvice]);

  return (
    data && (
      <ActualComponent
        data={data}
        setIsPending={setIsPending}
        onGetAdvice={onGetAdvice}
        setToggleGetAdvice={setToggleGetAdvice}
      />
    )
  );
};

const ActualComponent = ({
  data,
  setIsPending,
  onGetAdvice,
  setToggleGetAdvice,
}: {
  data: {
    log: Record<string, string> | null;
  };
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
  onGetAdvice: (advice: string) => void;
  setToggleGetAdvice: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const incrementAiCountMutation = useIncrementAiCount();
  const setError = useSetAtom(errorAtom);
  const user = useAtomValue(userAtom);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsPending(isPending || incrementAiCountMutation.isPending);
  }, [isPending, incrementAiCountMutation.isPending, setIsPending]);

  const handleSend = useCallback(() => {
    if (!user) setError("비정상적인 접근입니다.");
    const logInfo = data?.log
      ? `${Object.entries(data.log)
          .map((log) => `${log[0]}:${log[1]}`)
          .join(", ")}.`
      : "";
    startTransition(async () => {
      const res = await sendChatMessage(`${logInfo}`);
      onGetAdvice(res ?? "응답이 없습니다.");
      setToggleGetAdvice(false);
    });
  }, [user, setError, data, startTransition, onGetAdvice, setToggleGetAdvice]);

  useEffect(() => {
    incrementAiCountMutation.mutate(undefined, {
      onSuccess: () => handleSend(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
