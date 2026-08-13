import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { memo, useMemo, useState } from "react";
import { FaCheck, FaChevronUp, FaPlus, FaSave } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { motion } from "framer-motion";
import { MdEdit } from "react-icons/md";

import { EmptyState } from "@/components/atoms/EmptyState";
import { AddListItem } from "./AddListItem";
import { DataListItem, TodoDetailsModal } from "./DataListItem";
import { DataListItemType } from "./dataList";
import { useDataList } from "./hooks/useDataList";

const MAX_TODO_ITEMS = 100;

function DataListComponent({
  loading = false,
  title,
  name,
  defaultDataList,
  onSaveDataList,
  onDataListChange,
  deferSave = false,
  saveVersion,
  needCheckBox = false,
  storageKey,
  needDisableButton = false,
  emptyMessage = "조회할 목록이 없습니다.",
  titleAction,
  maxLength,
  enableTodoDetails = false,
}: {
  loading?: boolean;
  title: string;
  name: string;
  defaultDataList: DataListItemType[];
  onSaveDataList: (val: DataListItemType[]) => void;
  onDataListChange?: (val: DataListItemType[]) => void;
  deferSave?: boolean;
  saveVersion?: number;
  needCheckBox?: boolean;
  storageKey?: string | undefined;
  needDisableButton?: boolean;
  emptyMessage?: string;
  titleAction?: React.ReactNode;
  maxLength?: number | undefined;
  enableTodoDetails?: boolean;
}) {
  const {
    dataList,
    setDataList,
    isOpen,
    isEditing,
    hasItems,
    dragEnabled,
    debounce,
    sensors,
    itemIds,
    collapseTransition,
    handleDragEnd,
    handleSaveOrEdit,
    handleCancelEdit,
    handleToggleOpen,
    handleChangeText,
    handleUpdateItem,
    handleDeleteItem,
    handleToggleDisabled,
    handleChangeDone,
  } = useDataList({
    loading,
    defaultDataList,
    onSaveDataList,
    onDataListChange,
    deferSave,
    saveVersion,
    storageKey,
  });
  const [isCreateTodoOpen, setIsCreateTodoOpen] = useState(false);
  const canAddTodo = dataList.length < MAX_TODO_ITEMS;

  const renderedItems = useMemo(
    () =>
      dataList.map((item, index) => (
        <DataListItem
          title={title}
          key={item.id}
          item={item}
          index={index}
          isEditing={enableTodoDetails ? false : isEditing}
          enableDrag={dragEnabled}
          debounce={debounce}
          immediateTextChange={deferSave}
          onChangeText={handleChangeText}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onToggleDisabled={handleToggleDisabled}
          onChangeDone={handleChangeDone}
          needCheckBox={needCheckBox}
          needDisableButton={needDisableButton}
          maxLength={maxLength}
          enableTodoDetails={enableTodoDetails}
        />
      )),
    [
      dataList,
      debounce,
      deferSave,
      dragEnabled,
      enableTodoDetails,
      handleChangeDone,
      handleChangeText,
      handleDeleteItem,
      handleToggleDisabled,
      handleUpdateItem,
      isEditing,
      maxLength,
      needCheckBox,
      needDisableButton,
      title,
    ],
  );

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg text-xs shadow-lg shadow-stone-500 sm:text-sm">
      <div className="z-10 mb-1 flex h-14 w-full items-center justify-between bg-stone-700 px-2 text-white shadow-md shadow-stone-500">
        <div className="flex min-w-0 items-center gap-1">
          <span>{name}</span>
          {titleAction}
        </div>
        <div className="flex items-center gap-2">
          {enableTodoDetails ? (
            <button
              type="button"
              className={`flex items-center gap-1 rounded-full bg-white px-2 py-1 text-stone-700 ${
                loading || !canAddTodo
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              onClick={() => setIsCreateTodoOpen(true)}
              disabled={loading || !canAddTodo}
              aria-label="투두 추가"
            >
              <FaPlus size={14} aria-hidden="true" /> 추가하기
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`rounded-full bg-white p-1 ${
                  loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
                onClick={handleSaveOrEdit}
                disabled={loading}
                aria-label={
                  isEditing
                    ? deferSave
                      ? "편집 완료"
                      : "저장하기"
                    : "편집하기"
                }
              >
                {isEditing ? (
                  deferSave ? (
                    <FaCheck size={18} className="text-stone-700" />
                  ) : (
                    <FaSave size={18} className="text-stone-700" />
                  )
                ) : (
                  <MdEdit size={18} className="text-stone-700" />
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="rounded-full bg-white p-1"
                  onClick={handleCancelEdit}
                  aria-label="편집 취소"
                >
                  <GiCancel size={18} className="text-stone-700" />
                </button>
              )}
            </>
          )}
          {hasItems && (
            <button
              type="button"
              className={`rounded-full bg-white p-1 ${
                loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={handleToggleOpen}
              disabled={loading}
              aria-label={isOpen ? "목록 접기" : "목록 펼치기"}
            >
              <FaChevronUp
                size={18}
                className={`text-stone-700 transition-transform duration-300 ${
                  isOpen ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-1">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex h-12 items-center bg-white px-4 shadow-sm shadow-stone-500 sm:h-14"
            >
              <div className="flex w-full items-center gap-3">
                <div className="h-4 w-4 rounded bg-stone-300" />
                <div className="h-4 flex-1 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      ) : hasItems ? (
        <motion.div
          animate={{ maxHeight: isOpen ? 2000 : 0 }}
          transition={collapseTransition}
          className="overflow-hidden"
        >
          {dragEnabled && !enableTodoDetails ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {renderedItems}
              </SortableContext>
            </DndContext>
          ) : (
            <div>{renderedItems}</div>
          )}
        </motion.div>
      ) : (
        <EmptyState
          title={emptyMessage}
          className="min-h-12 rounded-none shadow-sm shadow-stone-500"
        />
      )}

      {!enableTodoDetails && isEditing && !loading && (
        <AddListItem
          title={title}
          dataList={dataList}
          setDataList={setDataList}
          maxLength={maxLength}
        />
      )}

      {isCreateTodoOpen && (
        <TodoDetailsModal
          item={{ id: Date.now(), text: "", isDone: false, type: "todo" }}
          isEditing
          onClose={() => setIsCreateTodoOpen(false)}
          onSave={(item) => setDataList([...dataList, item])}
        />
      )}
    </div>
  );
}

export const DataList = memo(DataListComponent);
