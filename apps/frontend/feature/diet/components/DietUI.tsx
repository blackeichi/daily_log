"use client";

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { modalAtom } from "@/lib/atom";
import { MODAL_STATE } from "@/constants/system";
import { ScheduleCalendar } from "@/components/organisms/scehduleCalendar";
import { DietUIProps } from "../types";
import { useDietPage } from "../useDietPage";

export default function DietUI({ initialData, initialDateRange }: DietUIProps) {
  const setModal = useSetAtom(modalAtom);

  const {
    user,
    loading,
    calendarData,
    totalMinusCalorie,
    setDateRange,
    setTargetMonth,
  } = useDietPage(initialData, initialDateRange);

  const handleCalendarClick = useCallback(
    (clickedDate: string) => {
      setModal({
        data: clickedDate,
        id: calendarData[clickedDate]
          ? MODAL_STATE.EDIT_CALORIES
          : MODAL_STATE.ADD_CALORIES,
      });
    },
    [calendarData, setModal],
  );

  return (
    <div className="h-full w-full">
      <ScheduleCalendar
        user={user}
        calendarData={calendarData}
        loading={loading}
        setDate={setDateRange}
        setTargetMonth={setTargetMonth}
        onClick={handleCalendarClick}
      />

      {!loading && user && (
        <div className="mx-1 mb-5 mt-1 flex flex-col gap-1 text-sm sm:mx-4">
          {totalMinusCalorie >= 0 ? (
            <>
              <p>
                이 달에 총 감량한 칼로리는{" "}
                <span className="font-bold underline">
                  {totalMinusCalorie} kcal
                </span>
                입니다.
              </p>
              <p>(약 {(totalMinusCalorie / 7000).toFixed(1)}kg 감량) 🫡</p>
            </>
          ) : (
            <>
              <p>
                이 달에 총 초과한 칼로리는{" "}
                <span className="font-bold underline">
                  {-totalMinusCalorie} kcal
                </span>
                입니다.
              </p>
              <p>(약 {(-totalMinusCalorie / 7000).toFixed(1)}kg 초과) 🍩</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
