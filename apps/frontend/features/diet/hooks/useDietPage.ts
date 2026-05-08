"use client";

import { useEffect, useMemo, useState } from "react";
import { isSameMonth } from "date-fns";
import { useAtomValue } from "jotai";
import { userAtom } from "@/lib/atom";
import { useAllDiet } from "@/lib/hooks/useDiet";
import { DietCalendarData, GetAllCalories } from "@/types/data";

export function useDietPage(
  initialData?: GetAllCalories[],
  initialDateRange?: [string, string],
) {
  const user = useAtomValue(userAtom);

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
      nextCalendarData[item.date] = {
        isChecked: item.isSuccess,
        calorie: item.totalCalorie,
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
    if (!user) return 0;

    let total = 0;

    Object.keys(calendarData).forEach((dateString) => {
      const item = calendarData[dateString];
      if (!item) return;

      if (isSameMonth(new Date(dateString), targetMonth)) {
        total += user.maximumCalorie - item.calorie;
      }
    });

    return total;
  }, [calendarData, targetMonth, user]);

  return {
    user,
    loading: isLoading,
    isError,
    isRetrying: isFetching,
    refetchDiet,
    calendarData,
    totalMinusCalorie,
    setDateRange,
    setTargetMonth,
  };
}
