import { useRoutines, useUpdateRoutines } from "@/app/libs/hooks/useRoutines";
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
  const { data, isLoading } = useRoutines();
  const updateRoutinesMutation = useUpdateRoutines();
  const [localData, setLocalData] = useState<RoutineData | null>(null);

  // 서버 데이터를 로컬 상태로 동기화
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

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
    updateRoutinesMutation.mutate({
      name: listName,
      data: newData,
    });
  };

  // 표시할 데이터: localData > data 우선순위
  const displayData = localData || data;

  return {
    data: displayData,
    handleUpdateList,
    loading: isLoading,
  };
};
