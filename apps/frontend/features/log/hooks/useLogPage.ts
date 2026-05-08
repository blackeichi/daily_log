"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { alertAtom, confirmAtom, errorAtom, modalAtom } from "@/lib/atom";
import { MODAL_STATE } from "@/constants/system";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useDeleteLog, useLogs, useLogsForExcel } from "@/lib/hooks/useLog";
import { downloadExcel } from "@/lib/utils/excelUtils";
import { GetLogsType } from "@/types/data";
import { LOG_ITEMS_PER_PAGE } from "../constants";

export const useLogPage = (initialData?: GetLogsType[]) => {
  const setModal = useSetAtom(modalAtom);
  const setConfirm = useSetAtom(confirmAtom);
  const setAlertMsg = useSetAtom(alertAtom);
  const setErrorMsg = useSetAtom(errorAtom);

  const [startDate, endDate, setStartDate, setEndDate] = useDateRange();
  const [searchTitle, setSearchTitle] = useState("");

  // 실제 검색에 사용되는 값들
  const [searchedStartDate, setSearchedStartDate] = useState(startDate);
  const [searchedEndDate, setSearchedEndDate] = useState(endDate);
  const [searchedTitle, setSearchedTitle] = useState("");

  const {
    data,
    isLoading: loading,
    isError,
    isFetching,
    refetch: onGetLogs,
  } = useLogs(
    searchedStartDate,
    searchedEndDate,
    searchedTitle,
    initialData ? { initialData } : undefined,
  );

  const [allData, setAllData] = useState<GetLogsType[] | null>(null);
  const [displayedData, setDisplayedData] = useState<GetLogsType[] | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;

    setAllData(data);
    setCurrentPage(1);
    setDisplayedData(data.slice(0, LOG_ITEMS_PER_PAGE));
  }, [data]);

  const loadMoreData = useCallback(() => {
    if (!allData || isLoadingMore) return;

    const nextPageEndIndex =
      currentPage * LOG_ITEMS_PER_PAGE + LOG_ITEMS_PER_PAGE;
    const canLoadMore = nextPageEndIndex < allData.length;

    if (!canLoadMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      setDisplayedData(allData.slice(0, nextPageEndIndex));
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [allData, currentPage, isLoadingMore]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const currentRef = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !allData || !displayedData) return;

          const canLoadMore = displayedData.length < allData.length;
          if (canLoadMore && !isLoadingMore) {
            loadMoreData();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [allData, displayedData, isLoadingMore, loadMoreData]);

  const deleteLogMutation = useDeleteLog();

  const {
    data: excelData,
    isFetching: excelLoading,
    refetch: getExcelData,
  } = useLogsForExcel(searchedStartDate, searchedEndDate, searchedTitle);

  useEffect(() => {
    if (!excelData) return;

    const success = downloadExcel(
      excelData,
      `로그_${searchedStartDate}_${searchedEndDate}`,
    );

    if (success) {
      setAlertMsg("엑셀 파일이 다운로드되었습니다.");
      return;
    }

    setErrorMsg("엑셀 다운로드 중 오류가 발생했습니다.");
  }, [excelData, searchedStartDate, searchedEndDate, setAlertMsg, setErrorMsg]);

  const handleGetExcelData = useCallback(() => {
    setConfirm({
      title: "엑셀 다운로드",
      message:
        "현재 검색 조건에 맞는 로그 데이터를 엑셀로 다운로드하시겠습니까?",
      confirmEvent: getExcelData,
    });
  }, [getExcelData, setConfirm]);

  const handleSearch = useCallback(() => {
    setSearchedStartDate(startDate);
    setSearchedEndDate(endDate);
    setSearchedTitle(searchTitle);
  }, [startDate, endDate, searchTitle]);

  const handleAddLog = useCallback(() => {
    setModal({
      id: MODAL_STATE.ADD_LOG,
    });
  }, [setModal]);

  const handleViewLog = useCallback(
    (row: GetLogsType) => {
      setModal({
        id: MODAL_STATE.VIEW_LOG,
        data: { id: row.id, title: row.title },
      });
    },
    [setModal],
  );

  const handleDeleteLog = useCallback(
    (row: GetLogsType) => {
      setConfirm({
        title: "로그 삭제",
        message: "정말로 해당 로그를 삭제하시겠습니까?",
        confirmEvent: () => {
          if (displayedData) {
            setDisplayedData(
              displayedData.filter((item) => item.id !== row.id),
            );
          }

          if (allData) {
            setAllData(allData.filter((item) => item.id !== row.id));
          }

          deleteLogMutation.mutate(
            { id: row.id },
            {
              onSuccess: () => setAlertMsg("로그가 삭제되었습니다."),
            },
          );
        },
      });
    },
    [allData, deleteLogMutation, displayedData, setAlertMsg, setConfirm],
  );

  const handleEditLog = useCallback(
    (row: GetLogsType) => {
      setModal({
        id: MODAL_STATE.EDIT_LOG,
        data: row.id,
      });
    },
    [setModal],
  );

  const hasMoreData =
    allData && displayedData ? displayedData.length < allData.length : false;

  return {
    loading,
    isError,
    isRetrying: isFetching,
    displayedData,
    allData,
    isLoadingMore,
    hasMoreData,
    loadMoreRef,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchTitle,
    setSearchTitle,
    searchedTitle,
    excelLoading,
    handleGetExcelData,
    handleSearch,
    refetchLogs: onGetLogs,
    handleAddLog,
    handleDeleteLog,
    handleEditLog,
    handleViewLog,
  };
};
