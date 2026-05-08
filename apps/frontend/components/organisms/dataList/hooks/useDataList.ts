import {
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { type Transition } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { DataListItemType, UseDataListParams } from "../dataList";

export function useDataList({
  loading,
  defaultDataList,
  onSaveDataList,
}: UseDataListParams) {
  const debounce = useDebounce();

  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dataList, setDataList] = useState<DataListItemType[]>(defaultDataList);

  useEffect(() => {
    setDataList(defaultDataList);
  }, [defaultDataList]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8, delay: 50 },
    }),
  );

  const itemIds = useMemo(() => dataList.map((item) => item.id), [dataList]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setDataList((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSaveOrEdit = useCallback(() => {
    if (loading) return;

    if (isEditing) {
      onSaveDataList(dataList);
      setIsEditing(false);
      return;
    }

    setIsEditing(true);
  }, [dataList, isEditing, loading, onSaveDataList]);

  const handleCancelEdit = useCallback(() => {
    setDataList(defaultDataList);
    setIsEditing(false);
  }, [defaultDataList]);

  const handleToggleOpen = useCallback(() => {
    if (loading || dataList.length === 0) return;

    setIsOpen((prev) => !prev);
  }, [dataList.length, loading]);

  const handleChangeText = useCallback((index: number, text: string) => {
    setDataList((prev) => {
      const target = prev[index];

      if (!target || target.text === text) return prev;

      const next = [...prev];
      next[index] = { ...target, text };

      return next;
    });
  }, []);

  const handleDeleteItem = useCallback((index: number) => {
    setDataList((prev) => {
      if (!prev[index]) return prev;

      const next = [...prev];
      next.splice(index, 1);

      return next;
    });
  }, []);

  const handleChangeDone = useCallback(
    (index: number, isDone: boolean) => {
      let nextList: DataListItemType[] | null = null;

      setDataList((prev) => {
        const target = prev[index];

        if (!target || target.isDone === isDone) return prev;

        const next = [...prev];
        next[index] = { ...target, isDone };
        nextList = next;

        return next;
      });

      debounce(() => {
        if (nextList) {
          onSaveDataList(nextList);
        }
      }, DEBOUNCE_DELAYS.CHECKBOX);
    },
    [debounce, onSaveDataList],
  );

  const hasItems = dataList.length > 0;
  const dragEnabled = isMounted && isEditing;

  const collapseTransition = useMemo<Transition>(
    () => ({
      duration:
        dataList.length === 0 ? 0.1 : Math.min(dataList.length * 0.05, 0.5),
      ease: "easeInOut",
    }),
    [dataList.length],
  );

  return {
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
    handleChangeDone,
  };
}
