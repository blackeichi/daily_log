import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import {
  useServerTodos,
  useSyncTodos,
  useTodoVersion,
} from "@/lib/hooks/useTodos";
import { alertAtom, confirmAtom, errorAtom } from "@/lib/atom";
import {
  localStorageUtilites,
  type LocalTodoSnapshot,
} from "@/lib/utils/storage";
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
  "기기에 저장하지 않은 Todo 변경사항이 있습니다. 페이지를 나가시겠습니까?";

const getTodoLists = (data: GetTodosType): UpdateAllTodosRequest => ({
  todayList: data.todayList,
  weekList: data.weekList,
  monthList: data.monthList,
  yearList: data.yearList,
  breakLimitList: data.breakLimitList,
});

const createEmptyTodos = (updatedAt: string): GetTodosType => ({
  id: 0,
  updatedAt,
  todayList: [],
  weekList: [],
  monthList: [],
  yearList: [],
  breakLimitList: [],
});

const listsAreEqual = (left: GetTodosType, right: GetTodosType) =>
  LIST_NAMES.every(
    (listName) =>
      JSON.stringify(left[listName]) === JSON.stringify(right[listName]),
  );

export const useTodo = () => {
  const setAlert = useSetAtom(alertAtom);
  const setConfirm = useSetAtom(confirmAtom);
  const setError = useSetAtom(errorAtom);
  const [initialSnapshot] = useState<LocalTodoSnapshot | null>(() =>
    localStorageUtilites.getTodos(),
  );
  const [localData, setLocalData] = useState<GetTodosType | null>(
    initialSnapshot?.data ?? null,
  );
  const [savedData, setSavedData] = useState<GetTodosType | null>(
    initialSnapshot?.data ?? null,
  );
  const [localUpdatedAt, setLocalUpdatedAt] = useState<string | null>(
    initialSnapshot?.updatedAt ?? null,
  );
  const [saveVersion, setSaveVersion] = useState(0);
  const hasChangesRef = useRef(false);
  const hasCheckedServerVersionRef = useRef(false);

  const versionQuery = useTodoVersion();
  const serverTodosQuery = useServerTodos();
  const syncTodos = useSyncTodos();

  const saveLocalSnapshot = useCallback(
    (data: GetTodosType, updatedAt: string) => {
      const nextData = { ...data, updatedAt };
      localStorageUtilites.setTodos({ data: nextData, updatedAt });
      hasChangesRef.current = false;
      setLocalData(nextData);
      setSavedData(nextData);
      setLocalUpdatedAt(updatedAt);
      setSaveVersion((previous) => previous + 1);
    },
    [],
  );

  const downloadServerTodos = useCallback(async () => {
    try {
      const result = await serverTodosQuery.refetch();
      if (!result.data) {
        throw new Error("서버에 저장된 Todo가 없습니다.");
      }
      saveLocalSnapshot(result.data, result.data.updatedAt);
      setAlert("서버의 최신 Todo를 이 기기에 동기화했습니다.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Todo 동기화 중 오류가 발생했습니다.",
      );
    }
  }, [saveLocalSnapshot, serverTodosQuery, setAlert, setError]);

  useEffect(() => {
    if (
      hasCheckedServerVersionRef.current ||
      !versionQuery.isFetchedAfterMount
    ) {
      return;
    }
    hasCheckedServerVersionRef.current = true;

    const serverVersion = versionQuery.data;
    if (!serverVersion) return;

    const localTime = localUpdatedAt ? Date.parse(localUpdatedAt) : 0;
    const serverTime = Date.parse(serverVersion.updatedAt);
    if (!Number.isFinite(serverTime) || serverTime <= localTime) return;

    const formattedDate = new Date(serverVersion.updatedAt).toLocaleString(
      "ko-KR",
      { dateStyle: "medium", timeStyle: "short" },
    );
    setConfirm({
      title: "최신 Todo 발견",
      message: `서버에 더 최신인 Todo가 있습니다.\n서버 저장 시각: ${formattedDate}\n\n이 기기의 Todo를 서버 데이터로 업데이트하시겠습니까?`,
      confirmEvent: () => {
        void downloadServerTodos();
      },
    });
  }, [
    downloadServerTodos,
    localUpdatedAt,
    setConfirm,
    versionQuery.data,
    versionQuery.isFetchedAfterMount,
  ]);

  const hasChanges = useMemo(() => {
    if (!localData || !savedData) return false;
    return !listsAreEqual(localData, savedData);
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
      setLocalData((previous) =>
        previous ? { ...previous, [listName]: newData } : previous,
      );
    },
    [],
  );

  const handleSaveTodos = useCallback(() => {
    if (!localData || !hasChanges) return;
    saveLocalSnapshot(localData, new Date().toISOString());
    setAlert("Todo를 이 기기에 저장했습니다.");
  }, [hasChanges, localData, saveLocalSnapshot, setAlert]);

  const uploadLocalTodos = useCallback(() => {
    if (!localData || syncTodos.isPending) return;

    syncTodos.mutate(getTodoLists(localData), {
      onSuccess: (serverData) => {
        saveLocalSnapshot(serverData, serverData.updatedAt);
        setAlert("이 기기의 Todo를 서버에 업로드했습니다.");
      },
      onError: (error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Todo 업로드 중 오류가 발생했습니다.",
        );
      },
    });
  }, [localData, saveLocalSnapshot, setAlert, setError, syncTodos]);

  const handleUploadTodos = useCallback(() => {
    if (!localData || syncTodos.isPending) return;
    setConfirm({
      title: "서버에 업로드",
      message:
        "현재 기기의 Todo를 서버에 업로드하시겠습니까?\n기존 서버 데이터는 현재 목록으로 교체됩니다.",
      confirmEvent: uploadLocalTodos,
    });
  }, [localData, setConfirm, syncTodos.isPending, uploadLocalTodos]);

  const handleCreateTodos = useCallback(() => {
    const updatedAt = new Date().toISOString();
    saveLocalSnapshot(createEmptyTodos(updatedAt), updatedAt);
  }, [saveLocalSnapshot]);

  return {
    data: localData,
    isFirst: !localData,
    hasChanges,
    isSaving: false,
    isUploading: syncTodos.isPending,
    isDownloading: serverTodosQuery.isFetching,
    saveVersion,
    handleCreateTodos,
    handleUpdateList,
    handleSaveTodos,
    handleUploadTodos,
  };
};
