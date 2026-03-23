import { useEffect, useState, useRef, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { DeleteLog, GetLogs, GetLogsForExcel } from "@/app/actions/client/log";
import {
  accessTokenAtom,
  alertAtom,
  errorAtom,
  modalAtom,
  confirmAtom,
} from "@/app/libs/atom";
import { useDateRange } from "@/app/libs/hooks/useDateRange";
import { downloadExcel } from "@/app/libs/utils/excelUtils";
import { GetLogsType } from "@/app/types/data";
import { MODAL_STATE } from "@/app/constants/system";

const ITEMS_PER_PAGE = 50;

export const useLog = () => {
  const accessToken = useAtomValue(accessTokenAtom);
  const setModal = useSetAtom(modalAtom);
  const setConfirm = useSetAtom(confirmAtom);
  const setAlertMsg = useSetAtom(alertAtom);
  const setErrorMsg = useSetAtom(errorAtom);

  // 날짜 범위 및 검색
  const [startDate, endDate, setStartDate, setEndDate] = useDateRange();
  const [searchTitle, setSearchTitle] = useState("");
  const [searchedTitle, setSearchedTitle] = useState("");

  // 데이터 fetch
  const [{ data, loading }, onGetLogs] = GetLogs(
    startDate,
    endDate,
    searchTitle,
  );

  useEffect(() => {
    if (accessToken && !data && !loading) {
      onGetLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // 무한 스크롤 상태
  const [allData, setAllData] = useState<GetLogsType[] | null>(null);
  const [displayedData, setDisplayedData] = useState<GetLogsType[] | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 전체 데이터 설정
  useEffect(() => {
    if (data) {
      setAllData(data);
      setCurrentPage(1);
      setDisplayedData(data.slice(0, ITEMS_PER_PAGE));
    }
  }, [data]);

  // 더 많은 데이터 로딩
  const loadMoreData = useCallback(() => {
    if (!allData || isLoadingMore) return;

    const nextPageEndIndex = currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE;
    const hasMoreData = nextPageEndIndex < allData.length;

    if (!hasMoreData) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const newData = allData.slice(0, nextPageEndIndex);
      setDisplayedData(newData);
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, [allData, isLoadingMore, currentPage]);

  // Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const currentRef = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && allData && displayedData) {
            const hasMoreData = displayedData.length < allData.length;
            if (hasMoreData && !isLoadingMore) {
              loadMoreData();
            }
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

  // 삭제
  const [{ data: deleteData }, onDeleteLog] = DeleteLog();

  useEffect(() => {
    if (deleteData?.message && allData && displayedData) {
      // 서버에서 삭제됨 - 로컬 상태는 이미 handleDeleteLog에서 업데이트됨
      setAlertMsg("로그가 삭제되었습니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteData]);

  // 엑셀 다운로드
  const [{ data: excelData, loading: excelLoading }, onGetExcelData] =
    GetLogsForExcel(startDate, endDate, searchTitle);

  useEffect(() => {
    if (excelData) {
      const success = downloadExcel(excelData, `로그_${startDate}_${endDate}`);
      if (success) {
        setAlertMsg("엑셀 파일이 다운로드되었습니다.");
      } else {
        setErrorMsg("엑셀 다운로드 중 오류가 발생했습니다.");
      }
    }
  }, [excelData, startDate, endDate, setAlertMsg, setErrorMsg]);

  // 검색 핸들러
  const handleSearch = () => {
    setSearchedTitle(searchTitle);
    onGetLogs();
  };

  // 새 로그 추가 핸들러
  const handleAddLog = () => {
    setModal({
      id: MODAL_STATE.ADD_LOG,
      callBack: () => onGetLogs(),
    });
  };

  // 로그 삭제 핸들러
  const handleDeleteLog = (row: GetLogsType) => {
    setConfirm({
      title: "로그 삭제",
      message: "정말로 해당 로그를 삭제하시겠습니까?",
      confirmEvent: () => {
        // Optimistic Update - 먼저 로컬 상태 업데이트
        if (displayedData) {
          const newDisplayedData = displayedData.filter(
            (item) => item.id !== row.id,
          );
          setDisplayedData(newDisplayedData);
        }
        if (allData) {
          const newAllData = allData.filter((item) => item.id !== row.id);
          setAllData(newAllData);
        }
        // 서버 요청
        onDeleteLog({ id: row.id });
      },
    });
  };

  // 로그 편집 핸들러
  const handleEditLog = (row: GetLogsType, index: number) => {
    setModal({
      id: MODAL_STATE.EDIT_LOG,
      data: row.id,
      callBack: (data?: unknown) => {
        if (typeof data === "string" && displayedData && displayedData[index]) {
          const newDisplayedData = [...displayedData];
          newDisplayedData[index] = {
            ...newDisplayedData[index],
            title: data,
          } as GetLogsType;
          setDisplayedData(newDisplayedData);

          if (allData) {
            const newAllData = [...allData];
            const originalIndex = allData.findIndex(
              (item) => item.id === row.id,
            );
            if (originalIndex !== -1) {
              newAllData[originalIndex] = {
                ...newAllData[originalIndex],
                title: data,
              } as GetLogsType;
              setAllData(newAllData);
            }
          }
        }
      },
    });
  };

  const hasMoreData =
    allData && displayedData ? displayedData.length < allData.length : false;

  return {
    // 상태
    loading: loading || !accessToken,
    displayedData,
    allData,
    isLoadingMore,
    hasMoreData,
    loadMoreRef,
    // 날짜 및 검색
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchTitle,
    setSearchTitle,
    searchedTitle,
    // 엑셀
    excelLoading,
    onGetExcelData,
    // 핸들러
    handleSearch,
    handleAddLog,
    handleDeleteLog,
    handleEditLog,
  };
};
