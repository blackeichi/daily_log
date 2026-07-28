import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { memo, useMemo } from "react";
import { EmptyState } from "@/components/atoms/EmptyState";
import { FaCheck, FaChevronUp, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEdit } from "react-icons/md";
import { GiCancel } from "react-icons/gi";
import { DataListItemType } from "./dataList";
import { AddListItem } from "./AddListItem";
import { DataListItem } from "./DataListItem";
import { useDataList } from "./hooks/useDataList";

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

  const renderedItems = useMemo(
    () =>
      dataList.map((item, index) => (
        <DataListItem
          title={title}
          key={item.id}
          item={item}
          index={index}
          isEditing={isEditing}
          enableDrag={dragEnabled}
          debounce={debounce}
          immediateTextChange={deferSave}
          onChangeText={handleChangeText}
          onDeleteItem={handleDeleteItem}
          onToggleDisabled={handleToggleDisabled}
          onChangeDone={handleChangeDone}
          needCheckBox={needCheckBox}
          needDisableButton={needDisableButton}
          maxLength={maxLength}
        />
      )),
    [
      dataList,
      title,
      isEditing,
      dragEnabled,
      debounce,
      handleChangeText,
      handleDeleteItem,
      handleToggleDisabled,
      handleChangeDone,
      needCheckBox,
      needDisableButton,
      maxLength,
    ],
  );

  return (
    <div className="flex flex-col w-full shadow-lg shadow-stone-500 rounded-lg overflow-hidden text-xs sm:text-sm">
      <div className="bg-stone-700 w-full h-14 mb-1 text-white flex justify-between items-center px-2 shadow-md shadow-stone-500 z-10">
        <div className="flex min-w-0 items-center gap-1">
          <span>{name}</span>
          {titleAction}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`bg-white rounded-full justify-center items-center p-1 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={handleSaveOrEdit}
            disabled={loading}
            aria-label={
              isEditing ? (deferSave ? "편집 완료" : "저장하기") : "편집하기"
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
              className="bg-white rounded-full justify-center items-center p-1 cursor-pointer"
              onClick={handleCancelEdit}
              aria-label="편집 취소"
            >
              <GiCancel size={18} className="text-stone-700" />
            </button>
          )}
          {hasItems && (
            <button
              type="button"
              className={`bg-white rounded-full justify-center items-center p-1 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white h-12 sm:h-14 flex items-center px-4 shadow-sm shadow-stone-500 animate-pulse"
            >
              <div className="flex gap-3 items-center w-full">
                <div className="h-4 bg-stone-300 rounded w-4"></div>
                <div className="h-4 bg-stone-200 rounded flex-1"></div>
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
          {dragEnabled ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
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
      {isEditing && !loading && (
        <AddListItem
          title={title}
          dataList={dataList}
          setDataList={setDataList}
          maxLength={maxLength}
        />
      )}
    </div>
  );
}

export const DataList = memo(DataListComponent);
