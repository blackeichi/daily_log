"use client";

import DataList from "@/app/components/organisms/dataList";
import { useRoutine } from "./useRoutineHook";

const lists = ["dailyRoutines", "weeklyRoutines", "monthlyRoutines"] as const;

const LIST_NAMES: { [key in (typeof lists)[number]]: string } = {
  dailyRoutines: "매일 하는 일",
  weeklyRoutines: "매주 하는 일",
  monthlyRoutines: "매달 하는 일",
};

export const RoutineUI = () => {
  const { data, handleUpdateList, loading } = useRoutine();

  return (
    <div className="w-full max-w-[800px] flex flex-col text-xs gap-10 pt-4">
      {lists.map((listName) => (
        <DataList
          key={listName}
          loading={loading}
          title="루틴"
          name={LIST_NAMES[listName]}
          defaultDataList={data?.[listName] || []}
          onSaveDataList={(val) => handleUpdateList(listName, val)}
        />
      ))}
    </div>
  );
};
