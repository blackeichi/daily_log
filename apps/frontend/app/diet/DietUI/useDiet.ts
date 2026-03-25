import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useAllDiet } from "@/app/libs/hooks/useDiet";
import { DietCalendarData, GetAllCalories } from "@/app/types/data";
import { isSameMonth } from "date-fns";
import { userAtom } from "@/app/libs/atom";

export const useDiet = (
  initialData?: GetAllCalories[],
  initialDateRange?: [string, string],
) => {
  const user = useAtomValue(userAtom);
  const [date, setDate] = useState<[string, string] | null>(
    initialDateRange ?? null,
  );
  const [targetMonth, setTargetMonth] = useState<Date>(new Date());

  const isInitialRange =
    date &&
    initialDateRange &&
    date[0] === initialDateRange[0] &&
    date[1] === initialDateRange[1];

  const { data, isLoading } = useAllDiet(
    date ? date[0] : "",
    date ? date[1] : "",
    isInitialRange && initialData !== undefined ? { initialData } : undefined,
  );
  const [localCalendarData, setLocalCalendarData] = useState<DietCalendarData>(
    {},
  );

  // 서버 데이터를 로컬 캘린더 데이터로 변환
  const transformedCalendarData = useMemo(() => {
    if (!data) return {};
    const newDate: DietCalendarData = {};
    data.forEach((d) => {
      newDate[d.date] = {
        isChecked: d.isSuccess,
        calorie: d.totalCalorie,
      };
    });
    return newDate;
  }, [data]);

  // 서버 데이터 또는 로컬 데이터 동기화
  useEffect(() => {
    if (data) {
      setLocalCalendarData(transformedCalendarData);
    }
  }, [data, transformedCalendarData]);

  // 월별 감량/초과 칼로리 계산
  const totalMinusCalorie = useMemo(() => {
    let totalCalorie = 0;
    Object.keys(localCalendarData).forEach((dateStr) => {
      if (
        user &&
        isSameMonth(new Date(dateStr), targetMonth) &&
        localCalendarData[dateStr]
      ) {
        totalCalorie +=
          user.maximumCalorie - localCalendarData[dateStr].calorie;
      }
    });
    return totalCalorie;
  }, [localCalendarData, user, targetMonth]);

  // 로컬 캘린더 데이터 업데이트 (Optimistic Update)
  const updateCalendarData = (newData: DietCalendarData) => {
    setLocalCalendarData({ ...localCalendarData, ...newData });
  };

  return {
    calendarData: localCalendarData,
    setDate,
    setTargetMonth,
    loading: isLoading,
    totalMinusCalorie,
    user,
    updateCalendarData,
  };
};
