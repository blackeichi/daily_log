"use client";

import Button from "@/components/atoms/button";
import DataList from "@/components/organisms/dataList";
import { useTodo } from "./useTodo";
import { GetTodosType, Todo } from "@/types/api";

const lists = [
  "todayList",
  "weekList",
  "monthList",
  "yearList",
  "breakLimitList",
] as const;

const LIST_NAMES: { [key in (typeof lists)[number]]: string } = {
  todayList: "오늘 할 일",
  weekList: "이번 주 할 일",
  monthList: "이번 달 할 일",
  yearList: "올해 할 일",
  breakLimitList: "한계돌파, 정화의식",
};

export const TodoUI = ({ initialData }: { initialData?: GetTodosType }) => {
  const { data, loading, isFirst, handleCreateTodos, handleUpdateList } =
    useTodo(initialData);

  if (isFirst)
    return (
      <div className="w-full h-full flex justify-center items-center flex-col gap-10 mt-20">
        <div className="flex flex-col gap-2">
          <span>오늘의 작은 계획이 내일의 큰 성과가 됩니다.</span>
          <span>지금 시작해 보세요! ✨</span>
        </div>
        <Button text="시작하기" width={200} onClick={handleCreateTodos} />
      </div>
    );
  return (
    <div className="w-full max-w-[800px] flex flex-col text-xs gap-10 pt-4">
      {lists.map((listName) => (
        <DataList
          key={listName}
          loading={loading}
          title="Todo"
          name={LIST_NAMES[listName]}
          defaultDataList={data?.[listName] || []}
          onSaveDataList={(val) => handleUpdateList(listName, val as Todo[])}
          needCheckBox
        />
      ))}
    </div>
  );
};
