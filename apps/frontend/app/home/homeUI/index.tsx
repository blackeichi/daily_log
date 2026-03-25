"use client";

import { Suspense } from "react";
import { ScheduleCalendar } from "@/app/components/organisms/scehduleCalendar";
import { useHome } from "./useHomeHook";
import { GetAllOverallT } from "@/app/types/data";

interface HomeUIProps {
  initialData?: GetAllOverallT[];
  initialDateRange?: [string, string];
}

export default function HomeUI({ initialData, initialDateRange }: HomeUIProps) {
  const { calendarData, loading, setDate, handleCalendarClick } = useHome(
    initialData,
    initialDateRange,
  );
  return (
    <>
      <div className="w-full h-full">
        <Suspense fallback={<div className="w-full h-full bg-stone-100" />}>
          <ScheduleCalendar
            calendarData={calendarData}
            loading={loading}
            setDate={setDate}
            onClick={handleCalendarClick}
          />
        </Suspense>
      </div>
    </>
  );
}
