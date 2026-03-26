export type Header = {
  id: string;
  label: string;
  width: number;
};

type funcProps<T> = {
  onClick?: (row: T, index: number) => void;
  onDelete?: (row: T, index: number) => void;
  onDoubleClick?: (row: T, index: number) => void;
};

export type TableProps<T> = {
  data?: T[] | null;
  isLoading: boolean;
  headers: Header[];
  noHeader?: boolean;
  needIndex?: boolean;
  rowUniqueKey?: string;
  lastRow?: Record<string, unknown>;
} & funcProps<T>;

export type TableHeaderProps<T> = {
  tableHeader: Header[];
} & funcProps<T>;

export type TableBodyProps<T> = {
  tableData: T[];
  rowUniqueKey: string;
  tableHeader: Header[];
  lastRow?: Record<string, unknown>;
} & funcProps<T>;

export type TableRowProps<T> = {
  rowUniqueKey: string;
  row: Record<string, unknown>;
  index: number;
  tableHeader: Header[];
} & funcProps<T>;
