import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import { useState } from "react";
import moment from "moment";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/lib/atom";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ko", ko);

export default function DateInput({
  id,
  date,
  setDate,
  label,
  width = 250,
  height = 35,
  required,
  disabled,
  noCalendar,
  minDate,
}: {
  id?: string;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  label?: string;
  width?: number | string;
  height?: number;
  required?: boolean;
  disabled?: boolean;
  noCalendar?: boolean;
  minDate?: string;
}) {
  const setError = useSetAtom(errorAtom);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative flex items-center text-xs"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: `${height}px`,
      }}
      onFocus={(e) => {
        if (!e.relatedTarget || disabled) {
          return;
        }
        setFocused(true);
      }}
      onBlur={(e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
          return;
        }
        setFocused(false);
      }}
      onClick={() => {
        if (!focused && !disabled) setFocused(true);
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !focused && !disabled) {
          e.preventDefault();
          setFocused(true);
        }
      }}
      aria-label={label || "날짜 선택"}
    >
      <div
        className={`absolute -top-2 left-1 z-10 flex items-center gap-1 bg-stone-100 px-1 ${disabled ? "text-stone-400" : "text-stone-800"} ${
          required ? "font-bold" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {label}
      </div>
      <DatePicker
        id={`${id}-date-input`}
        locale="ko"
        selected={new Date(date)}
        onChange={(value) => {
          if (value) {
            if (minDate && moment(value).isBefore(moment(minDate))) {
              setDate(minDate);
              return setError(`선택할 수 있는 최소 날짜는 ${minDate}입니다.`);
            }
            setDate(moment(value).format("YYYY-MM-DD"));
            setFocused(false);
          }
        }}
        open={noCalendar ? false : focused}
        dateFormat="yyyy-MM-dd"
        placeholderText="날짜 선택"
        className={`border p-3 border-stone-300 w-full h-full focus:border-3 outline-0 focus:border-stone-600 pl-2 ${
          disabled ? "bg-stone-100 text-stone-400" : ""
        }`}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
