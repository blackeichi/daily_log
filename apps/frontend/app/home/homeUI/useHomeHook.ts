import { useSetAtom } from "jotai";
import { modalAtom } from "../../libs/atom";
import { useCallback, useEffect, useState } from "react";
import { useAllOverall } from "../../libs/hooks/useOverall";
import { GetAllOverallT, OverallCalendarData } from "../../types/data";
import { MODAL_STATE } from "../../constants/system";

export const useHome = (
  initialData?: GetAllOverallT[],
  initialDateRange?: [string, string],
) => {
  const setModal = useSetAtom(modalAtom);
  const [date, setDate] = useState<[string, string] | null>(
    initialDateRange ?? null,
  );

  const isInitialRange =
    date &&
    initialDateRange &&
    date[0] === initialDateRange[0] &&
    date[1] === initialDateRange[1];

  const { data, isLoading } = useAllOverall(
    date ? date[0] : "",
    date ? date[1] : "",
    isInitialRange && initialData !== undefined ? { initialData } : undefined,
  );
  const [localCalendarData, setLocalCalendarData] =
    useState<OverallCalendarData>({});

  // 서버 데이터를 로컬 캘린더 데이터로 변환
  useEffect(() => {
    if (data) {
      const newDate: OverallCalendarData = {};
      data.forEach((d) => {
        newDate[d.reviewDate] = {
          emotion: d.emotion,
        };
      });
      setLocalCalendarData(newDate);
    }
  }, [data]);

  // 로컬 캘린더 데이터 업데이트 (Optimistic Update)
  const updateCalendarData = useCallback((newData: OverallCalendarData) => {
    setLocalCalendarData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleCalendarClick = useCallback(
    (clickedDate: string) => {
      setModal({
        data: clickedDate,
        id: localCalendarData[clickedDate]
          ? MODAL_STATE.EDIT_OVERALL
          : MODAL_STATE.ADD_OVERALL,
        callBack: (data?: unknown) => {
          const newData = data as OverallCalendarData;
          updateCalendarData(newData);
        },
      });
    },
    [localCalendarData, setModal, updateCalendarData],
  );

  return {
    calendarData: localCalendarData,
    loading: isLoading,
    setDate,
    handleCalendarClick,
  };
};
