import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useScheduleCalendar = ({
  setDate,
  setTargetMonth,
}: {
  setDate: React.Dispatch<React.SetStateAction<[string, string] | null>>;
  setTargetMonth: React.Dispatch<React.SetStateAction<Date>> | undefined;
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = useMemo(() => new Date(), []);

  const { monthStart, monthEnd, weeks, monthKey } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    // 달력 시작일: 해당 월의 첫 날이 속한 주의 일요일
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    // 달력 종료일: 해당 월의 마지막 날이 속한 주의 토요일
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    // 달력에 표시될 모든 날짜 생성 (이전 달, 현재 달, 다음 달 포함)
    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    // 7일씩 나눠서 주 단위로 배열 생성
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      monthStart,
      monthEnd,
      weeks,
      monthKey: format(currentMonth, "yyyy-MM"),
    };
  }, [currentMonth]);

  useEffect(() => {
    const start = format(monthStart, "yyyy-MM-dd");
    const end = format(monthEnd, "yyyy-MM-dd");
    if (setTargetMonth) setTargetMonth(currentMonth);
    setDate([start, end]);
  }, [monthKey, monthStart, monthEnd, setDate, setTargetMonth, currentMonth]);
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const getTextColor = useCallback((dayOfWeek: number) => {
    if (dayOfWeek === 0) return "text-red-700";
    if (dayOfWeek === 6) return "text-blue-700";
    return "text-black";
  }, []);

  const getDayOfWeek = (date: Date): number => {
    return date.getDay();
  };

  return {
    handlePrevMonth,
    currentMonth,
    handleNextMonth,
    weeks,
    today,
    getDayOfWeek,
    getTextColor,
  };
};
