import { useAtomValue, useSetAtom } from "jotai";
import { accessTokenAtom, modalAtom } from "../../libs/atom";
import { useCallback, useEffect, useState } from "react";
import { GetAllOverall } from "../../actions/client/overall";
import { OverallCalendarData } from "../../types/data";
import { MODAL_STATE } from "../../constants/system";

export const useHome = () => {
  const accessToken = useAtomValue(accessTokenAtom);
  const setModal = useSetAtom(modalAtom);
  const [date, setDate] = useState<[string, string] | null>(null);
  const [{ data, loading }, onGetAllOverall] = GetAllOverall(
    date ? date[0] : "",
    date ? date[1] : "",
  );
  const [localCalendarData, setLocalCalendarData] =
    useState<OverallCalendarData>({});

  // 날짜 변경 시 데이터 가져오기
  useEffect(() => {
    if (date && accessToken) {
      onGetAllOverall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, accessToken]);

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
    loading: loading || !accessToken,
    setDate,
    handleCalendarClick,
  };
};
