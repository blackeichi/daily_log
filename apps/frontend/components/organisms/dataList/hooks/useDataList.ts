import {
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { type Transition } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  setTodoTreeDone,
  type DataListItemType,
  type UseDataListParams,
} from "../dataList";

const DATA_LIST_OPEN_STORAGE_PREFIX = "DAILY_LOG_DATA_LIST_OPEN";

export function useDataList({
  loading,
  defaultDataList,
  onSaveDataList,
  onDataListChange,
  deferSave = false,
  saveVersion,
  storageKey,
}: UseDataListParams) {
  const debounce = useDebounce();
  const saveDebounce = useDebounce();

  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dataList, setDataList] = useState<DataListItemType[]>(defaultDataList);
  const dataListRef = useRef(defaultDataList);
  const editSnapshotRef = useRef<DataListItemType[] | null>(null);
  const previousSaveVersionRef = useRef(saveVersion);

  useEffect(() => {
    dataListRef.current = defaultDataList;
    setDataList(defaultDataList);
  }, [defaultDataList]);

  useEffect(() => {
    if (
      saveVersion === undefined ||
      previousSaveVersionRef.current === saveVersion
    ) {
      return;
    }

    previousSaveVersionRef.current = saveVersion;
    editSnapshotRef.current = null;
    dataListRef.current = defaultDataList;
    setDataList(defaultDataList);
    setIsEditing(false);
  }, [defaultDataList, saveVersion]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!storageKey) return;

    try {
      const savedValue = localStorage.getItem(
        `${DATA_LIST_OPEN_STORAGE_PREFIX}:${storageKey}`,
      );

      if (savedValue !== null) {
        setIsOpen(JSON.parse(savedValue));
      }
    } catch {
      setIsOpen(true);
    }
  }, [storageKey]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8, delay: 50 },
    }),
  );

  const itemIds = useMemo(() => dataList.map((item) => item.id), [dataList]);

  const updateDataList = useCallback(
    (next: DataListItemType[]) => {
      dataListRef.current = next;
      setDataList(next);
      onDataListChange?.(next);
    },
    [onDataListChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const prev = dataListRef.current;
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) return;

      updateDataList(arrayMove(prev, oldIndex, newIndex));
    },
    [updateDataList],
  );

  const handleSaveOrEdit = useCallback(() => {
    if (loading) return;

    if (isEditing) {
      onSaveDataList(dataListRef.current);
      editSnapshotRef.current = null;
      setIsEditing(false);
      return;
    }

    editSnapshotRef.current = dataListRef.current;
    setIsEditing(true);
  }, [isEditing, loading, onSaveDataList]);

  const handleCancelEdit = useCallback(() => {
    updateDataList(editSnapshotRef.current ?? defaultDataList);
    editSnapshotRef.current = null;
    setIsEditing(false);
  }, [defaultDataList, updateDataList]);

  const handleToggleOpen = useCallback(() => {
    if (loading || dataList.length === 0) return;

    setIsOpen((prev) => {
      const next = !prev;

      if (storageKey) {
        try {
          localStorage.setItem(
            `${DATA_LIST_OPEN_STORAGE_PREFIX}:${storageKey}`,
            JSON.stringify(next),
          );
        } catch {
          // Ignore storage failures so the in-memory toggle still works.
        }
      }

      return next;
    });
  }, [dataList.length, loading, storageKey]);

  const handleChangeText = useCallback(
    (index: number, text: string) => {
      const prev = dataListRef.current;
      const target = prev[index];

      if (!target || target.isDisabled || target.text === text) return;

      const next = [...prev];
      next[index] = { ...target, text };

      updateDataList(next);
    },
    [updateDataList],
  );

  const handleUpdateItem = useCallback(
    (index: number, item: DataListItemType) => {
      const prev = dataListRef.current;
      if (!prev[index]) return;

      const next = [...prev];
      next[index] = item;
      updateDataList(next);
    },
    [updateDataList],
  );

  const handleDeleteItem = useCallback(
    (index: number) => {
      const prev = dataListRef.current;
      if (!prev[index] || prev[index].isDisabled) return;

      const next = [...prev];
      next.splice(index, 1);

      updateDataList(next);
    },
    [updateDataList],
  );

  const handleToggleDisabled = useCallback(
    (index: number) => {
      const prev = dataListRef.current;
      const target = prev[index];

      if (!target || target.type === "section") return;

      const next = [...prev];
      next[index] = { ...target, isDisabled: !target.isDisabled };
      updateDataList(next);

      if (!deferSave) {
        saveDebounce(() => onSaveDataList(next), DEBOUNCE_DELAYS.CHECKBOX);
      }
    },
    [deferSave, onSaveDataList, saveDebounce, updateDataList],
  );

  const handleChangeDone = useCallback(
    (index: number, isDone: boolean) => {
      const prev = dataListRef.current;
      const target = prev[index];

      if (!target || target.isDone === isDone) return;

      const next = [...prev];
      next[index] = setTodoTreeDone(target, isDone);
      updateDataList(next);

      if (!deferSave) {
        saveDebounce(() => onSaveDataList(next), DEBOUNCE_DELAYS.CHECKBOX);
      }
    },
    [deferSave, onSaveDataList, saveDebounce, updateDataList],
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
    setDataList: updateDataList,

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
  };
}
