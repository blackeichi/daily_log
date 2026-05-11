import { ReactNode } from "react";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export type Header<T> = {
  id: string;
  label: string;
  width: number;
  grow?: number;
  render?: (row: T, index: number) => ReactNode;
};

type funcProps<T> = {
  onClick?: (row: T, index: number) => void;
  onEdit?: (row: T, index: number) => void;
  onDelete?: (row: T, index: number) => void;
};

export type TableProps<T> = {
  data?: T[] | null;
  isLoading: boolean;
  headers: Header<T>[];
  needIndex?: boolean;
  rowUniqueKey?: string;
  lastRow?: Record<string, unknown>;
  emptyMessage?: string;
} & funcProps<T>;

export type RowRecord = Record<string, unknown>;
export type RowAction<T> = (row: T, index: number) => void;

export type TableAction<T> = {
  key: "edit" | "detail" | "delete";
  label: string;
  icon: typeof MdEdit | typeof FaTrash;
  iconSize: number;
  color: string;
  handler: RowAction<T>;
};

export type RowItem<T> =
  | { type: "data"; row: T; index: number }
  | { type: "last"; row: RowRecord; index: number };

export type VirtualRowData<T> = {
  items: RowItem<T>[];
  columns: Header<T>[];
  rowUniqueKey: string;
  actions: TableAction<T>[];
  onClick: RowAction<T> | undefined;
  tableMinWidth: number;
};
