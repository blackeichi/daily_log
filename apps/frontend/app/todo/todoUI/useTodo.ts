import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { CreateTodos, GetTodos, UpdateTodos } from "@/app/actions/client/todo";
import { accessTokenAtom } from "@/app/libs/atom";
import { GetTodosType, Todo } from "@/app/types/api";

type ListName =
  | "todayList"
  | "weekList"
  | "monthList"
  | "yearList"
  | "breakLimitList";

export const useTodo = () => {
  const accessToken = useAtomValue(accessTokenAtom);
  const [{ data, loading }, onGetTodos] = GetTodos();
  const [, onCreateTodos] = CreateTodos();
  const [isFirst, setIsFirst] = useState(false);
  const [localData, setLocalData] = useState<GetTodosType | null>(null);

  // 첫 방문 여부 확인
  useEffect(() => {
    if (data && !data.id && !loading) {
      setIsFirst(true);
    }
  }, [data, loading]);

  // 토큰 있을 때 데이터 가져오기 (초기 로드 시에만)
  useEffect(() => {
    if (accessToken && !data && !loading) {
      onGetTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const [, onUpdateTodos] = UpdateTodos(data?.id ?? 0);

  /*   // UpdateTodos 성공 후 응답 데이터로 즉시 업데이트
  useEffect(() => {
    if (updateState.data && !updateState.loading) {
      setLocalData(updateState.data);
    }
  }, [updateState.data, updateState.loading]); */

  const handleUpdateList = (listName: ListName, newData: Todo[]) => {
    // Optimistic update - 즉시 로컬 상태 업데이트
    setLocalData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        [listName]: newData,
      };
    });
    // 그 다음 서버 요청
    onUpdateTodos({
      name: listName,
      data: newData,
    });
  };

  const handleCreateTodos = () => {
    onCreateTodos();
  };

  // 표시할 데이터: localData > data 우선순위 (로컬에서 업데이트된 데이터 우선)
  const displayData = localData || data;

  return {
    data: displayData,
    loading: loading || !accessToken,
    isFirst,
    handleCreateTodos,
    handleUpdateList,
  };
};
