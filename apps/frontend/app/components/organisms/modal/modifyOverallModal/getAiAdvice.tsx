import { GetAllData, UpdateAiCount } from "@/app/actions/client/user";
import { sendChatMessage } from "@/app/actions/server/chat";
import { errorAtom, userAtom } from "@/app/libs/atom";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useTransition } from "react";

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
  const [{ data, error }, onGetAllData] = GetAllData(date);
  useEffect(() => {
    onGetAllData();
  }, [onGetAllData]);
  useEffect(() => {
    if (error) {
      setIsPending(false);
      onGetAdvice();
    }
  }, [error, setIsPending, onGetAdvice]);
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
    /* todos: Todo[] | null;
    calorie: GetCalorie | null; */
    log: Record<string, string> | null;
  };
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
  onGetAdvice: (advice: string) => void;
  setToggleGetAdvice: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [{ data: updateRes, loading }, onUpdateAiCount] = UpdateAiCount();
  const setError = useSetAtom(errorAtom);
  const user = useAtomValue(userAtom);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    setIsPending(isPending || loading);
  }, [isPending, loading, setIsPending]);
  const handleSend = useCallback(() => {
    if (!user) setError("비정상적인 접근입니다.");
    /* const calInfo = data?.calorie
      ? `내 목표칼로리는 ${user?.goalCalorie}이고, 최대 섭취량은 ${user?.maximumCalorie}야. 오늘 섭취한 음식들은 ${data.calorie.eatenList
          .map((item) => `${item.name}(${item.cal}kcal)`)
          .join(", ")}이야.`
      : ""; */
    const logInfo = data?.log
      ? `${Object.entries(data.log)
          .map((log) => `${log[0]}:${log[1]}`)
          .join(", ")}.`
      : "";
    startTransition(async () => {
      // const res = await sendChatMessage(`${calInfo} ${logInfo}`);
      const res = await sendChatMessage(`${logInfo}`);
      onGetAdvice(res ?? "응답이 없습니다.");
      setToggleGetAdvice(false);
    });
  }, [user, setError, data, startTransition, onGetAdvice, setToggleGetAdvice]);
  useEffect(() => {
    onUpdateAiCount();
  }, [onUpdateAiCount]);
  useEffect(() => {
    if (updateRes) {
      handleSend();
    }
  }, [updateRes, handleSend]);
  return <></>;
};
