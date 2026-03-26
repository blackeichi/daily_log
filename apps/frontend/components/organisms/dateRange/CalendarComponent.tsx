import moment from "moment";
import React, { useState } from "react";
import Calendar from "react-calendar";
import { CalendarDateRangeComponent } from "./CalendarDateRangeComponent";
import Button from "../../atoms/button";
import { InputManuallyComponent } from "./InputManuallyComponent";
import { OkCancelBtns } from "../../molecules/okCancelBtns";
import "react-calendar/dist/Calendar.css";
import "@/lib/utils/calendar.css";

export const CalendarComponent = ({
  position,
  height,
  fromValue,
  setFromValue,
  toValue,
  setToValue,
  onClose,
}: {
  position: { x: number; y: number } | null;
  height: string;
  fromValue: string;
  setFromValue: React.Dispatch<React.SetStateAction<string>>;
  toValue: string;
  setToValue: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
}) => {
  const [startDate, setStartDate] = useState(fromValue);
  const [endDate, setEndDate] = useState(toValue);
  const onChageDate = (dateData: unknown) => {
    setStartDate(moment((dateData as Date[])[0]).format("YYYY-MM-DD"));
    setEndDate(moment((dateData as Date[])[1]).format("YYYY-MM-DD"));
  };
  return (
    <div
      className="fixed z-20 shadow-lg shadow-stone-500 rounded-sm py-4 px-4 flex flex-col gap-2 items-center bg-stone-100"
      style={
        position
          ? {
              top: `calc(${position.y}px + ${height} + 5px)`,
              left: `calc(${position.x}px)`,
            }
          : {}
      }
      onClick={(event) => event.stopPropagation()}
    >
      <CalendarDateRangeComponent startDate={startDate} endDate={endDate} />
      <div className="flex gap-2.5">
        <Button
          text="오늘"
          width="80px"
          height="35px"
          contained={false}
          onClick={() => {
            const start = moment().format("YYYY-MM-DD");
            const end = moment().format("YYYY-MM-DD");
            setStartDate(start);
            setEndDate(end);
          }}
        />
        <Button
          text="지난 일주일"
          width="80px"
          height="35px"
          contained={false}
          onClick={() => {
            const start = moment().subtract(1, "week").format("YYYY-MM-DD");
            const end = moment().format("YYYY-MM-DD");
            setStartDate(start);
            setEndDate(end);
          }}
        />
        <Button
          text="지난 한 달"
          width="80px"
          height="35px"
          contained={false}
          onClick={() => {
            const start = moment().subtract(1, "month").format("YYYY-MM-DD");
            const end = moment().format("YYYY-MM-DD");
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>
      <Calendar
        onChange={onChageDate}
        formatDay={(_, date) => moment(date).format("DD")}
        selectRange={true}
        value={[startDate, endDate]}
      />
      <InputManuallyComponent
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <OkCancelBtns
        className="mt-2"
        submitText="적용"
        cancelText="취소"
        onSubmit={() => {
          setFromValue(startDate);
          setToValue(endDate);
          onClose();
        }}
        width={100}
        onCancel={onClose}
      />
    </div>
  );
};
