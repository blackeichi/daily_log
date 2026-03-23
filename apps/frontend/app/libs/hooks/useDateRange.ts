import { useState } from "react";
import moment from "moment";

export const useDateRange = (
  defaultStartDate?: string,
  defaultEndDate?: string,
) => {
  const [startDate, setStartDate] = useState(
    defaultStartDate || moment().subtract(3, "months").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate || moment().format("YYYY-MM-DD"),
  );

  return [startDate, endDate, setStartDate, setEndDate] as const;
};
