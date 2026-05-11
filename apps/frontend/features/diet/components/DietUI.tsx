"use client";

import QueryRetry from "@/components/molecules/QueryRetry";
import { EmptyState } from "@/components/atoms/EmptyState";
import { ScheduleCalendar } from "@/components/organisms/scehduleCalendar";
import { DietUIProps } from "../types";
import { useDietPage } from "../hooks/useDietPage";

export default function DietUI({ initialData, initialDateRange }: DietUIProps) {
  const {
    user,
    loading,
    hasDietData,
    isError,
    isRetrying,
    refetchDiet,
    calendarData,
    totalMinusCalorie,
    setDateRange,
    setTargetMonth,
    handleCalendarClick,
  } = useDietPage(initialData, initialDateRange);

  if (isError) {
    return (
      <div className="h-full w-full pt-4">
        <QueryRetry
          message="식단 기록 조회에 실패했습니다."
          onRetry={() => refetchDiet()}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

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

      {!loading && !hasDietData && (
        <EmptyState
          title="데이터가 없습니다."
          description="식단을 추가해주세요."
          className="mx-1 mb-5 mt-3 sm:mx-4"
        />
      )}

      {!loading && hasDietData && user && (
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
