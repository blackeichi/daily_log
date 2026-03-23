"use client";

import { Suspense } from "react";
import { ScheduleCalendar } from "@/app/components/organisms/scehduleCalendar";
import { useHome } from "./useHomeHook";

export default function HomeUI() {
  const { calendarData, loading, setDate, handleCalendarClick } = useHome();
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
