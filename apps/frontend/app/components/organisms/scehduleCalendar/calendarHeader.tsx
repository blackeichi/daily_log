"server component";

import { format } from "date-fns";

export const CalendarHeader = ({ date }: { date: Date }) => {
  return (
    <h1 className="flex items-center gap-2 text-base sm:text-lg font-bold">
      {format(date, "yyyy년 MM월")}
    </h1>
  );
};
