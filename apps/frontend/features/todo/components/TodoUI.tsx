"use client";

import Button from "@/components/atoms/button";
import QueryRetry from "@/components/molecules/QueryRetry";
import type { GetTodosType, Todo } from "@/types/api";
import { useTodo } from "../hooks/useTodoPage";
import { DataList } from "@/components/organisms/dataList";
import { TodayMemoButton } from "./TodayMemoButton";
import { FaSave, FaSpinner } from "react-icons/fa";

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

export default function TodoUI({
  initialData,
}: {
  initialData?: GetTodosType;
}) {
  const {
    data,
    loading,
    isError,
    isRetrying,
    refetchTodos,
    isFirst,
    hasChanges,
    isSaving,
    saveVersion,
    handleCreateTodos,
    handleUpdateList,
    handleSaveTodos,
  } = useTodo(initialData);

  if (isError) {
    return (
      <div className="w-full max-w-[800px] pt-4">
        <QueryRetry
          message="투두 조회에 실패했습니다."
          onRetry={() => refetchTodos()}
          isRetrying={isRetrying}
        />
      </div>
    );
  }

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
          onDataListChange={(val) => handleUpdateList(listName, val as Todo[])}
          deferSave
          saveVersion={saveVersion}
          needCheckBox
          needDisableButton
          maxLength={1000}
          storageKey={`todo:${listName}`}
          emptyMessage="데이터가 없습니다. Todo를 추가해주세요."
          titleAction={
            listName === "todayList" ? <TodayMemoButton /> : undefined
          }
        />
      ))}
      {hasChanges && (
        <button
          type="button"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-stone-700 text-white shadow-lg shadow-stone-500 transition-colors hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 disabled:cursor-wait disabled:bg-stone-400 sm:bottom-8 sm:right-8"
          onClick={handleSaveTodos}
          disabled={isSaving}
          aria-label="모든 Todo 변경사항 저장"
          title="모든 Todo 변경사항 저장"
        >
          {isSaving ? (
            <FaSpinner className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <FaSave size={18} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
