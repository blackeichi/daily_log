"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isSameMonth } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import { modalAtom, userAtom } from "@/lib/atom";
import { useAllDiet } from "@/lib/hooks/useDiet";
import { DietCalendarData, GetAllCalories } from "@/types/data";
import { MODAL_STATE } from "@/constants/system";

export function useDietPage(
  initialData?: GetAllCalories[],
  initialDateRange?: [string, string],
) {
  const user = useAtomValue(userAtom);
  const setModal = useSetAtom(modalAtom);

  const [dateRange, setDateRange] = useState<[string, string] | null>(
    initialDateRange ?? null,
  );
  const [targetMonth, setTargetMonth] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<DietCalendarData>({});

  const isInitialRange =
    !!dateRange &&
    !!initialDateRange &&
    dateRange[0] === initialDateRange[0] &&
    dateRange[1] === initialDateRange[1];

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchDiet,
  } = useAllDiet(
    dateRange ? dateRange[0] : "",
    dateRange ? dateRange[1] : "",
    isInitialRange && initialData !== undefined ? { initialData } : undefined,
  );

  const transformedCalendarData = useMemo(() => {
    if (!data) return {};

    const nextCalendarData: DietCalendarData = {};

    data.forEach((item) => {
      const memo = item.memo.trim();

      nextCalendarData[item.date] = {
        isChecked: item.isSuccess,
        calorie: item.totalCalorie,
        goalCalorie: item.goalCalorie,
        maximumCalorie: item.maximumCalorie,
        ...(memo ? { text: memo } : {}),
      };
    });

    return nextCalendarData;
  }, [data]);

  useEffect(() => {
    if (data) {
      setCalendarData(transformedCalendarData);
    }
  }, [data, transformedCalendarData]);

  const totalMinusCalorie = useMemo(() => {
    let total = 0;

    Object.keys(calendarData).forEach((dateString) => {
      const item = calendarData[dateString];
      if (!item) return;

      if (isSameMonth(new Date(dateString), targetMonth)) {
        total += item.maximumCalorie - item.calorie;
      }
    });

    return total;
  }, [calendarData, targetMonth]);

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

  return {
    user,
    hasDietData: !!data?.length,
    loading: isLoading,
    isError,
    isRetrying: isFetching,
    refetchDiet,
    calendarData,
    totalMinusCalorie,
    setDateRange,
    setTargetMonth,
    handleCalendarClick,
  };
}
