import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import IconButton from "../../molecules/iconButton";
import { format, isSameDay, isSameMonth } from "date-fns";
import { memo } from "react";
import { User } from "@/app/types/api";
import { CalendarHeader } from "./calendarHeader";
import { useScheduleCalendar } from "./useScehduleCalendarHook";

const dateColorMap = {
  today: "bg-amber-100",
  currentMonth: "bg-white hover:bg-stone-100",
  otherMonth: "bg-stone-100 text-stone-500 hover:bg-stone-200",
};

const Calendar = ({
  user,
  calendarData,
  loading = false,
  setDate,
  setTargetMonth,
  onClick,
}: {
  user?: User | null;
  calendarData: {
    [date: string]: {
      isChecked?: boolean;
      emotion?: string;
      text?: string;
      calorie?: number;
    };
  };
  loading?: boolean;
  setDate: React.Dispatch<React.SetStateAction<[string, string] | null>>;
  setTargetMonth?: React.Dispatch<React.SetStateAction<Date>>;
  onClick: (date: string) => void;
}) => {
  const {
    handlePrevMonth,
    currentMonth,
    handleNextMonth,
    weeks,
    today,
    getDayOfWeek,
    getTextColor,
    getEmoji,
  } = useScheduleCalendar({
    setTargetMonth,
    user,
    setDate,
  });
  return (
    <div className="w-full mx-auto relative flex flex-col mt-3 sm:mt-6">
      <div className={`flex flex-col relative gap-2 p-1 sm:p-4 rounded-sm`}>
        <div
          className={`flex w-full mb-3 sm:mb-6 mt-2 items-center gap-5 justify-center sm:justify-start`}
        >
          <IconButton
            icon={GrFormPrevious}
            onClick={handlePrevMonth}
            className="w-8 h-8"
            size={18}
            ariaLabel="previous month button"
          />
          <CalendarHeader date={currentMonth} />
          <IconButton
            icon={GrFormNext}
            onClick={handleNextMonth}
            className="w-8 h-8"
            size={18}
            ariaLabel="next month button"
          />
        </div>
        <div className="grid grid-cols-7 text-center font-bold ">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className={`p-2 rounded-xl`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-5 border-stone-300 border h-fit shadow-md shadow-stone-500 select-none">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);
                const dateStr = format(day, "yyyy-MM-dd");
                const dayOfWeek = getDayOfWeek(day);
                const textColor = getTextColor(dayOfWeek);
                const value = calendarData[dateStr];
                const emoji = getEmoji(value?.calorie);

                return (
                  <button
                    type="button"
                    key={dateStr}
                    className={`min-h-20 flex flex-col gap-2 h-[12vh] p-2 text-xs sm:text-sm transition-[background-color] border-stone-300 border-b border-r text-left cursor-pointer
                      ${
                        isToday
                          ? dateColorMap.today
                          : isCurrentMonth
                            ? dateColorMap.currentMonth
                            : dateColorMap.otherMonth
                      }`}
                    onClick={() => {
                      if (!loading) onClick(dateStr);
                    }}
                    disabled={loading}
                    aria-label={`${format(day, "yyyy\ub144 M\uc6d4 d\uc77c")} ${value?.emotion || ""}`}
                  >
                    {loading ? (
                      // 스켈레톤 UI
                      <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-4 bg-stone-300 rounded w-1/3"></div>
                        <div className="h-3 bg-stone-200 rounded w-2/3"></div>
                        <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                      </div>
                    ) : (
                      <>
                        <div className={`${textColor} flex gap-2 items-center`}>
                          {format(day, "d")}
                          {emoji && <span>{emoji}</span>}
                        </div>
                        {value?.calorie !== undefined ? (
                          <span>{`${value.calorie} kcal`}</span>
                        ) : null}
                        <span className="text-ellipsis overflow-hidden whitespace-nowrap text-center">
                          {value?.text}
                          {value?.emotion && (
                            <span className="text-base">{value.emotion}</span>
                          )}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ScheduleCalendar = memo(Calendar);
