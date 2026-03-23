import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { memo, useEffect, useState } from "react";
import { FaChevronUp, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdEdit } from "react-icons/md";
import { useDebounce } from "@/app/libs/hooks/useDebounce";
import { GiCancel } from "react-icons/gi";
import {
  DataListItem,
  type DataListItem as DataListItemType,
} from "@/app/components/molecules/DataListItem";
import { AddListItem } from "@/app/components/molecules/AddListItem";

export type DataList = DataListItemType;

function DataListComponent({
  loading = false,
  title,
  name,
  defaultDataList,
  onSaveDataList,
  needCheckBox = false,
}: {
  loading?: boolean;
  title: string;
  name: string;
  defaultDataList: DataList[];
  onSaveDataList: (val: DataList[]) => void;
  needCheckBox?: boolean;
}) {
  const debounce = useDebounce();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dataList, setDataList] = useState<DataList[]>(defaultDataList);
  useEffect(() => {
    setDataList(defaultDataList);
  }, [defaultDataList]);

  // 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8, delay: 50 },
    }),
  );
  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dataList.findIndex((i) => i.id === active.id);
      const newIndex = dataList.findIndex((i) => i.id === over?.id);
      setDataList(arrayMove(dataList, oldIndex, newIndex));
    }
  };
  const hasItems = dataList && dataList.length > 0;
  return (
    <div className="flex flex-col w-full shadow-lg shadow-stone-500 rounded-lg overflow-hidden text-xs sm:text-sm">
      {/* Header */}
      <div
        className={`bg-stone-700 w-full h-14 mb-1 text-white flex justify-between items-center px-2 shadow-md shadow-stone-500 z-10`}
      >
        <span>{name}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`bg-white rounded-full justify-center items-center p-1 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={() => {
              if (loading) return;
              if (isEditing) {
                onSaveDataList(dataList);
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading}
            aria-label={isEditing ? "저장하기" : "편집하기"}
          >
            {isEditing ? (
              <FaSave size={18} className="text-stone-700" />
            ) : (
              <MdEdit size={18} className="text-stone-700" />
            )}
          </button>
          {isEditing && (
            <button
              type="button"
              className="bg-white rounded-full justify-center items-center p-1 cursor-pointer"
              onClick={() => {
                setDataList(defaultDataList);
                setIsEditing(false);
              }}
              aria-label="편집 취소"
            >
              <GiCancel size={18} className="text-stone-700" />
            </button>
          )}
          {hasItems && (
            <button
              type="button"
              className={`bg-white rounded-full justify-center items-center p-1 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => {
                if (loading) return;
                if (hasItems) setIsOpen((prev) => !prev);
              }}
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
      {/* Body - Collapsible */}
      {loading ? (
        // 스켈레톤 UI
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
          animate={{ maxHeight: isOpen ? 1000 : 0 }}
          transition={{
            duration: dataList?.length === 0 ? 0.1 : dataList?.length * 0.05,
            ease: "easeInOut",
          }}
          className="overflow-hidden"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dataList.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {dataList.map((item, index) => (
                <DataListItem
                  title={title}
                  key={item.id}
                  item={item}
                  index={index}
                  dataList={dataList}
                  setDataList={setDataList}
                  isEditing={isEditing}
                  debounce={debounce}
                  onSaveDataList={onSaveDataList}
                  needCheckBox={needCheckBox}
                />
              ))}
            </SortableContext>
          </DndContext>
        </motion.div>
      ) : (
        <div className="flex h-10 sm:h-12 items-center bg-white shadow-sm shadow-stone-500 justify-center">
          <span>조회할 목록이 없습니다.</span>
        </div>
      )}
      {isEditing && !loading && (
        <AddListItem
          title={title}
          dataList={dataList}
          setDataList={setDataList}
        />
      )}
    </div>
  );
}

export default memo(DataListComponent);
