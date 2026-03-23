import DateInput from "../../atoms/dateInput";

export const InputManuallyComponent = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="flex gap-2.5 mt-2">
      <DateInput
        date={startDate}
        setDate={setStartDate}
        id="startDateInput"
        label="시작일"
        width={145}
        noCalendar
      />
      <DateInput
        date={endDate}
        setDate={setEndDate}
        id="endDateInput"
        label="종료일"
        width={145}
        noCalendar
      />
    </div>
  );
};
