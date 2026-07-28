import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import {
  useTodos,
  useCreateTodos,
  useUpdateAllTodos,
} from "@/lib/hooks/useTodos";
import { alertAtom, errorAtom } from "@/lib/atom";
import type { GetTodosType, Todo, UpdateAllTodosRequest } from "@/types/api";

const LIST_NAMES = [
  "todayList",
  "weekList",
  "monthList",
  "yearList",
  "breakLimitList",
] as const;

type ListName = (typeof LIST_NAMES)[number];

const UNSAVED_CHANGES_MESSAGE =
  "저장하지 않은 Todo 변경사항이 있습니다. 페이지를 나가시겠습니까?";

const getTodoLists = (data: GetTodosType): UpdateAllTodosRequest => ({
  todayList: data.todayList,
  weekList: data.weekList,
  monthList: data.monthList,
  yearList: data.yearList,
  breakLimitList: data.breakLimitList,
});

export const useTodo = (initialData?: GetTodosType) => {
  const setAlert = useSetAtom(alertAtom);
  const setError = useSetAtom(errorAtom);
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchTodos,
  } = useTodos(initialData ? { initialData } : undefined);
  const { mutate: createTodos } = useCreateTodos();
  const updateAllTodos = useUpdateAllTodos(data?.id ?? initialData?.id ?? 0);
  const [isFirst, setIsFirst] = useState(false);
  const [localData, setLocalData] = useState<GetTodosType | null>(
    initialData ?? null,
  );
  const [savedData, setSavedData] = useState<GetTodosType | null>(
    initialData ?? null,
  );
  const [saveVersion, setSaveVersion] = useState(0);
  const hasChangesRef = useRef(false);

  // 첫 방문 여부 확인
  useEffect(() => {
    if (data && !isLoading) {
      setIsFirst(!data.id);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (!data || hasChangesRef.current) return;

    setLocalData(data);
    setSavedData(data);
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!localData || !savedData) return false;

    return LIST_NAMES.some(
      (listName) =>
        JSON.stringify(localData[listName]) !==
        JSON.stringify(savedData[listName]),
    );
  }, [localData, savedData]);

  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    if (!hasChanges) return;

    const currentUrl = window.location.href;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const targetUrl = new URL(anchor.href, window.location.href);
      if (targetUrl.href === window.location.href) return;

      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (window.confirm(UNSAVED_CHANGES_MESSAGE)) return;

      window.history.pushState(null, "", currentUrl);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasChanges]);

  const handleUpdateList = useCallback(
    (listName: ListName, newData: Todo[]) => {
      setLocalData((prevData) => {
        if (!prevData) return prevData;

        return {
          ...prevData,
          [listName]: newData,
        };
      });
    },
    [],
  );

  const handleSaveTodos = useCallback(() => {
    if (!localData || !hasChanges || updateAllTodos.isPending) return;

    updateAllTodos.mutate(getTodoLists(localData), {
      onSuccess: (updatedData) => {
        hasChangesRef.current = false;
        setLocalData(updatedData);
        setSavedData(updatedData);
        setSaveVersion((prev) => prev + 1);
        setAlert("Todo 변경사항을 저장했습니다.");
      },
      onError: (error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Todo 저장 중 오류가 발생했습니다.",
        );
      },
    });
  }, [hasChanges, localData, setAlert, setError, updateAllTodos]);

  const handleCreateTodos = useCallback(() => {
    createTodos(undefined);
  }, [createTodos]);

  const displayData = localData || data;

  return {
    data: displayData,
    loading: isLoading,
    isError,
    isRetrying: isFetching,
    refetchTodos,
    isFirst,
    hasChanges,
    isSaving: updateAllTodos.isPending,
    saveVersion,
    handleCreateTodos,
    handleUpdateList,
    handleSaveTodos,
  };
};
