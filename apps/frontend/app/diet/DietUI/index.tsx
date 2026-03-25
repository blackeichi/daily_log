"use client";

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { MODAL_STATE } from "@/app/constants/system";
import { DietCalendarData, GetAllCalories } from "@/app/types/data";
import { modalAtom } from "@/app/libs/atom";
import { ScheduleCalendar } from "@/app/components/organisms/scehduleCalendar";
import { useDiet } from "./useDiet";

interface DietUIProps {
  initialData?: GetAllCalories[];
  initialDateRange?: [string, string];
}

export default function DietUI({ initialData, initialDateRange }: DietUIProps) {
  const setModal = useSetAtom(modalAtom);
  const {
    calendarData,
    setDate,
    setTargetMonth,
    loading,
    totalMinusCalorie,
    user,
    updateCalendarData,
  } = useDiet(initialData, initialDateRange);

  const handleCalendarClick = useCallback(
    (clickedDate: string) =>
      setModal({
        data: clickedDate,
        id: calendarData[clickedDate]
          ? MODAL_STATE.EDIT_CALORIES
          : MODAL_STATE.ADD_CALORIES,
        callBack: (data?: unknown) => {
          const newData = data as DietCalendarData;
          updateCalendarData(newData);
        },
      }),
    [calendarData, setModal, updateCalendarData],
  );
  return (
    <div className="w-full h-full">
      {
        <ScheduleCalendar
          user={user}
          calendarData={calendarData}
          loading={loading}
          setDate={setDate}
          setTargetMonth={setTargetMonth}
          onClick={handleCalendarClick}
        />
      }
      {!loading && user && (
        <h1 className="mx-1 sm:mx-4 mb-5 mt-1 text-sm flex gap-1 flex-col">
          {totalMinusCalorie >= 0 ? (
            <>
              <p>
                이 달에 총 감량한 칼로리는{" "}
                <span className="font-bold underline">
                  {totalMinusCalorie} kcal
                </span>
                입니다.
              </p>
              (약 {(totalMinusCalorie / 7000).toFixed(1)}kg 감량) 🫡
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
              (약 {(-totalMinusCalorie / 7000).toFixed(1)}kg 초과) 🐖
            </>
          )}
        </h1>
      )}
    </div>
  );
}
