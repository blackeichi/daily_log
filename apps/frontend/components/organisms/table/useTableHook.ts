import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

import { COLOR_THEME } from "@/constants/system";
import { getTableMinWidth } from "./utils";
import type {
  Header,
  RowAction,
  RowItem,
  RowRecord,
  TableAction,
  VirtualRowData,
} from "./table";

type UseTableHookProps<T> = {
  data: T[] | null | undefined;
  headers: Header<T>[];
  onClick: RowAction<T> | undefined;
  onEdit: RowAction<T> | undefined;
  onDelete: RowAction<T> | undefined;
  rowUniqueKey: string | undefined;
  lastRow: RowRecord | undefined;
};

export function useTableHook<T>({
  data,
  headers,
  onEdit,
  onClick,
  onDelete,
  rowUniqueKey = "id",
  lastRow,
}: UseTableHookProps<T>) {
  const rows = useMemo(() => data ?? [], [data]);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const [bodyScrollElement, setBodyScrollElement] =
    useState<HTMLDivElement | null>(null);

  const isSyncingScroll = useRef(false);

  const setBodyOuterRef = useCallback((node: HTMLDivElement | null) => {
    bodyScrollRef.current = node;
    setBodyScrollElement(node);
  }, []);

  const actions = useMemo<TableAction<T>[]>(() => {
    const nextActions: TableAction<T>[] = [];

    if (onEdit) {
      nextActions.push({
        key: "edit",
        label: "행 수정",
        icon: MdEdit,
        iconSize: 20,
        color: COLOR_THEME.DARK_GRAY,
        handler: onEdit,
      });
    }

    if (onDelete) {
      nextActions.push({
        key: "delete",
        label: "행 삭제",
        icon: FaTrash,
        iconSize: 15,
        color: COLOR_THEME.RED_COLOR,
        handler: onDelete,
      });
    }

    return nextActions;
  }, [onEdit, onDelete]);

  const tableMinWidth = useMemo(
    () => getTableMinWidth(headers, actions.length),
    [headers, actions.length],
  );

  const items = useMemo<RowItem<T>[]>(() => {
    const dataItems: RowItem<T>[] = rows.map((row, index) => ({
      type: "data",
      row,
      index,
    }));

    if (!lastRow) return dataItems;

    return [
      ...dataItems,
      {
        type: "last",
        row: lastRow as RowRecord,
        index: rows.length,
      },
    ];
  }, [rows, lastRow]);

  const syncScroll = useCallback(
    (target: "header" | "body", scrollLeft: number) => {
      if (isSyncingScroll.current) return;

      isSyncingScroll.current = true;

      const targetRef = target === "header" ? bodyScrollRef : headerScrollRef;

      if (targetRef.current) {
        targetRef.current.scrollLeft = scrollLeft;
      }

      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    },
    [],
  );

  useEffect(() => {
    if (!bodyScrollElement) return;

    let lastScrollLeft = bodyScrollElement.scrollLeft;

    const handleBodyScroll = () => {
      const nextScrollLeft = bodyScrollElement.scrollLeft;

      if (lastScrollLeft === nextScrollLeft) {
        return;
      }

      lastScrollLeft = nextScrollLeft;
      syncScroll("body", nextScrollLeft);
    };

    bodyScrollElement.addEventListener("scroll", handleBodyScroll, {
      passive: true,
    });

    return () => {
      bodyScrollElement.removeEventListener("scroll", handleBodyScroll);
    };
  }, [bodyScrollElement, syncScroll]);

  const listData = useMemo<VirtualRowData<T>>(
    () => ({
      items,
      columns: headers,
      rowUniqueKey,
      actions,
      onClick,
      tableMinWidth,
    }),
    [items, headers, rowUniqueKey, actions, onClick, tableMinWidth],
  );

  return {
    rows,
    items,
    actions,
    tableMinWidth,
    listData,
    headerScrollRef,
    setBodyOuterRef,
    syncScroll,
  };
}
