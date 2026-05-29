"use client";

import QueryRetry from "@/components/molecules/QueryRetry";
import { Routine } from "@/types/api";
import { useRoutine } from "../hooks/useRoutinePage";
import { DataList } from "@/components/organisms/dataList";

const lists = ["dailyRoutines", "weeklyRoutines", "monthlyRoutines"] as const;

const LIST_NAMES: { [key in (typeof lists)[number]]: string } = {
  dailyRoutines: "매일 하는 일",
  weeklyRoutines: "매주 하는 일",
  monthlyRoutines: "매달 하는 일",
};

export default function RoutineUI({ initialData }: { initialData?: Routine }) {
  const {
    data,
    isError,
    isRetrying,
    refetchRoutines,
    handleUpdateList,
    loading,
  } = useRoutine(initialData);

  if (isError) {
    return (
      <div className="w-full max-w-[800px] pt-4">
        <QueryRetry
          message="루틴 조회에 실패했습니다."
          onRetry={() => refetchRoutines()}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

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
          storageKey={`routine:${listName}`}
          emptyMessage="데이터가 없습니다. 루틴을 추가해주세요."
        />
      ))}
    </div>
  );
}
