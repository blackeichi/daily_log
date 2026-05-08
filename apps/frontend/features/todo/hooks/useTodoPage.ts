import { useCallback, useEffect, useState } from "react";
import {
  useTodos,
  useCreateTodos,
  useUpdateTodos,
} from "@/lib/hooks/useTodos";
import { GetTodosType, Todo } from "@/types/api";

type ListName =
  | "todayList"
  | "weekList"
  | "monthList"
  | "yearList"
  | "breakLimitList";

export const useTodo = (initialData?: GetTodosType) => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchTodos,
  } = useTodos(initialData ? { initialData } : undefined);
  const { mutate: createTodos } = useCreateTodos();
  const { mutate: updateTodos } = useUpdateTodos(data?.id ?? 0);
  const [isFirst, setIsFirst] = useState(false);
  const [localData, setLocalData] = useState<GetTodosType | null>(null);

  // 첫 방문 여부 확인
  useEffect(() => {
    if (data && !data.id && !isLoading) {
      setIsFirst(true);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  const handleUpdateList = useCallback(
    (listName: ListName, newData: Todo[]) => {
      // Optimistic update - 즉시 로컬 상태 업데이트
      setLocalData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          [listName]: newData,
        };
      });
      // 그 다음 서버 요청
      updateTodos({
        name: listName,
        data: newData,
      });
    },
    [updateTodos],
  );

  const handleCreateTodos = useCallback(() => {
    createTodos(undefined);
  }, [createTodos]);

  // 표시할 데이터: localData > data 우선순위 (로컬에서 업데이트된 데이터 우선)
  const displayData = localData || data;

  return {
    data: displayData,
    loading: isLoading,
    isError,
    isRetrying: isFetching,
    refetchTodos,
    isFirst,
    handleCreateTodos,
    handleUpdateList,
  };
};
