import { useRoutines, useUpdateRoutines } from "@/lib/hooks/useRoutines";
import { useCallback, useEffect, useState } from "react";
import { Routine } from "@/types/api";
import { ListName, RoutineData, RoutineItem } from "../types";

export const useRoutine = (initialData?: Routine) => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchRoutines,
  } = useRoutines(initialData ? { initialData } : undefined);
  const { mutate: updateRoutines } = useUpdateRoutines();
  const [localData, setLocalData] = useState<RoutineData | null>(null);

  // 서버 데이터를 로컬 상태로 동기화
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  // Optimistic update
  const handleUpdateList = useCallback(
    (listName: ListName, newData: RoutineItem[]) => {
      // 즉시 UI 업데이트
      setLocalData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          [listName]: newData,
        };
      });
      // 그 다음 서버 요청
      updateRoutines({
        name: listName,
        data: newData,
      });
    },
    [updateRoutines],
  );

  // 표시할 데이터: localData > data 우선순위
  const displayData = localData || data;

  return {
    data: displayData,
    isError,
    isRetrying: isFetching,
    refetchRoutines,
    handleUpdateList,
    loading: isLoading,
  };
};
