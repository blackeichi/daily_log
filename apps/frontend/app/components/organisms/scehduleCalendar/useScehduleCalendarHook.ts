import { User } from "@/app/types/api";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useScheduleCalendar = ({
  user,
  setDate,
  setTargetMonth,
}: {
  user: User | null | undefined;
  setDate: React.Dispatch<React.SetStateAction<[string, string] | null>>;
  setTargetMonth: React.Dispatch<React.SetStateAction<Date>> | undefined;
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = useMemo(() => new Date(), []);

  const { monthStart, monthEnd, weeks, monthKey } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    const days: Date[] = [];
    let currentDate = new Date(monthStart);
    while (currentDate <= monthEnd) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

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

  const getEmoji = useCallback(
    (calorie: number | undefined) => {
      if (calorie === undefined || !user) return "";
      if (calorie <= user.goalCalorie) return "🚩";
      if (calorie <= user.maximumCalorie) return "✅";
      return "🐷";
    },
    [user],
  );

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
    getEmoji,
  };
};
