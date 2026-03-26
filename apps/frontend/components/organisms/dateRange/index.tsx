import { useState } from "react";
import { FaCalendar } from "react-icons/fa";
import { CalendarComponent } from "./CalendarComponent";

export const DateRange = ({
  fromPlaceholder,
  toPlaceholder,
  height = "35px",
  width = "200px",
  fromValue,
  setFromValue,
  toValue,
  setToValue,
  disabled = false,
}: {
  fromPlaceholder: string;
  toPlaceholder?: string;
  height?: string;
  width?: string;
  fromValue: string;
  setFromValue: React.Dispatch<React.SetStateAction<string>>;
  toValue: string;
  setToValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const onClose = () => {
    setIsFocus(false);
    setPosition(null);
  };
  return (
    <div
      className="relative flex items-center text-xs"
      tabIndex={-1}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onClose();
        }
      }}
      style={{
        height,
        width,
      }}
    >
      <div
        className={`w-full h-full relative flex items-center border border-stone-300 rounded-sm gap-2.5 pl-1.5 ${disabled ? "text-stone-300" : "text-stone-700"}`}
        onClick={(event) => {
          if (!disabled) {
            const target = event.currentTarget.getBoundingClientRect();
            const yPosition =
              event.clientY < 300
                ? target.top
                : target.top - 670 - target.height;
            setPosition({
              x: target.left,
              y: yPosition < 0 ? 0 : yPosition,
            });
            setIsFocus((prev) => !prev);
          }
        }}
      >
        <span className="absolute left-1.5 items-center -top-2 z-10 flex gap-1 bg-stone-100">
          {fromPlaceholder}
          {toPlaceholder ? <>~ {toPlaceholder}</> : ""}
        </span>
        {fromValue && toValue ? (
          <>
            <span>{fromValue}</span>
            <span>{`~`}</span>
            <span>{toValue}</span>
          </>
        ) : (
          <span
            style={{
              color: "darkgray",
              fontSize: "11px",
            }}
          >
            NO DATE
          </span>
        )}
        <div
          className={`absolute cursor-pointer ${disabled ? "text-stone-300" : "text-stone-700"} right-2 z-10`}
        >
          <FaCalendar />
        </div>
      </div>
      {!disabled && isFocus && position && (
        <CalendarComponent
          position={position}
          height={height}
          fromValue={fromValue}
          setFromValue={setFromValue}
          toValue={toValue}
          setToValue={setToValue}
          onClose={onClose}
        />
      )}
    </div>
  );
};
