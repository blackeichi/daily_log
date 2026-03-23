import { GetRoutines, ModifyRoutines } from "@/app/actions/client/routine";
import { accessTokenAtom } from "@/app/libs/atom";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

type ListName = "dailyRoutines" | "weeklyRoutines" | "monthlyRoutines";
type RoutineItem = { id: number; text: string };

interface RoutineData {
  id: number;
  dailyRoutines: RoutineItem[];
  weeklyRoutines: RoutineItem[];
  monthlyRoutines: RoutineItem[];
}

export const useRoutine = () => {
  const accessToken = useAtomValue(accessTokenAtom);
  const [{ data, loading }, onGetRoutines] = GetRoutines();
  const [localData, setLocalData] = useState<RoutineData | null>(null);

  // 초기 로드 시에만 데이터 가져오기
  useEffect(() => {
    if (accessToken && !data && !loading) {
      onGetRoutines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // 서버 데이터를 로컬 상태로 동기화
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  const [, onModifyRoutines] = ModifyRoutines();

  /*   // ModifyRoutines 성공 후 응답 데이터로 즉시 업데이트
  useEffect(() => {
    if (modifyState.data && !modifyState.loading) {
      setLocalData(modifyState.data);
    }
  }, [modifyState.data, modifyState.loading]); */

  // Optimistic update
  const handleUpdateList = (listName: ListName, newData: RoutineItem[]) => {
    // 즉시 UI 업데이트
    setLocalData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        [listName]: newData,
      };
    });
    // 그 다음 서버 요청
    onModifyRoutines({
      name: listName,
      data: newData,
    });
  };

  // 표시할 데이터: localData > data 우선순위
  const displayData = localData || data;

  return {
    data: displayData,
    handleUpdateList,
    loading: loading || !accessToken,
  };
};
