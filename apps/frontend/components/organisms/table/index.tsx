import { useCallback } from "react";
import type { RefObject } from "react";
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import IconButton from "../../molecules/iconButton";
import { EmptyState } from "@/components/atoms/EmptyState";
import { TableSkeleton } from "@/components/molecules/TableSkeleton";
import { COLOR_THEME } from "@/constants/system";
import { typedMemo } from "@/lib/utils/component";
import {
  Header,
  RowAction,
  RowItem,
  RowRecord,
  TableAction,
  TableProps,
} from "./table";
import { getColumnStyle, getTableWidthStyle } from "./utils";
import { ACTION_COLUMN_WIDTH, ROW_HEIGHT } from "./constants";
import { useTableHook } from "./useTableHook";

function Table<T>({
  data,
  isLoading,
  headers,
  onEdit,
  onClick,
  onDelete,
  rowUniqueKey = "id",
  lastRow,
  emptyMessage = "데이터가 없습니다.",
}: TableProps<T>) {
  const {
    rows,
    items,
    actions,
    tableMinWidth,
    listData,
    headerScrollRef,
    setBodyOuterRef,
    syncScroll,
  } = useTableHook<T>({
    data,
    headers,
    onEdit,
    onClick,
    onDelete,
    rowUniqueKey,
    lastRow,
  });

  const RowRenderer = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const item = listData.items[index];

      if (!item) {
        return (
          <div
            style={{
              ...style,
              ...getTableWidthStyle(listData.tableMinWidth),
            }}
          />
        );
      }

      return (
        <div
          style={{
            ...style,
            ...getTableWidthStyle(listData.tableMinWidth),
          }}
        >
          <TableRow
            item={item}
            columns={listData.columns}
            rowUniqueKey={listData.rowUniqueKey}
            actions={listData.actions}
            onClick={item.type === "data" ? listData.onClick : undefined}
            tableMinWidth={listData.tableMinWidth}
          />
        </div>
      );
    },
    [listData],
  );

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-md border border-stone-300 shadow-lg shadow-stone-500
      }`}
    >
      <TableHeader
        scrollRef={headerScrollRef}
        columns={headers}
        actionCount={actions.length}
        tableMinWidth={tableMinWidth}
        onScroll={(scrollLeft) => syncScroll("header", scrollLeft)}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyMessage} className="min-h-11 rounded-none" />
      ) : (
        <div className="min-h-0 flex-1 py-1 text-xs">
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <FixedSizeList
                outerRef={setBodyOuterRef}
                height={height}
                width={width}
                itemCount={items.length}
                itemSize={ROW_HEIGHT}
                className="show_scrollbar w-full"
              >
                {RowRenderer}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
      )}
    </div>
  );
}

function TableHeader<T>({
  scrollRef,
  columns,
  actionCount,
  tableMinWidth,
  onScroll,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  columns: Header<T>[];
  actionCount: number;
  tableMinWidth: number;
  onScroll: (scrollLeft: number) => void;
}) {
  return (
    <div
      ref={scrollRef}
      onScroll={(event) => onScroll(event.currentTarget.scrollLeft)}
      className="noScrollBar flex h-[55px] shrink-0 items-center overflow-x-auto bg-stone-700 p-1 pl-3 pr-[11px] text-xs text-white shadow-md shadow-stone-500 select-none"
      role="rowgroup"
    >
      <div
        className="flex h-full items-center font-semibold"
        style={getTableWidthStyle(tableMinWidth)}
        role="row"
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex h-full items-center p-1"
            style={getColumnStyle(column.width, column.grow)}
            role="columnheader"
          >
            {column.label}
          </div>
        ))}

        {Array.from({ length: actionCount }).map((_, index) => (
          <div
            key={index}
            className="shrink-0"
            style={{
              width: ACTION_COLUMN_WIDTH,
              minWidth: ACTION_COLUMN_WIDTH,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TableRow<T>({
  item,
  columns,
  rowUniqueKey,
  actions,
  onClick,
  tableMinWidth,
}: {
  item: RowItem<T>;
  columns: Header<T>[];
  rowUniqueKey: string;
  actions: TableAction<T>[];
  onClick: RowAction<T> | undefined;
  tableMinWidth: number;
}) {
  const isClickable = Boolean(onClick);
  const row = item.row as RowRecord;
  const rowIndex = item.index;
  const dataRow = item.row as T;

  const handleClick = () => {
    if (item.type === "data") {
      onClick?.(dataRow, rowIndex);
    }
  };

  return (
    <div
      className={`flex items-center border-b border-b-stone-300 pl-3 pr-1 transition-[background-color] hover:bg-stone-200 ${
        item.type === "last"
          ? "rounded-sm font-bold"
          : isClickable
            ? "cursor-pointer hover:underline hover:underline-offset-2"
            : ""
      }`}
      style={getTableWidthStyle(tableMinWidth)}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (!isClickable) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role={isClickable ? "button" : "row"}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? "행 상세 보기" : undefined}
    >
      {columns.map((column) => (
        <div
          key={`${column.id}-${String(row[rowUniqueKey] ?? rowIndex)}`}
          className="flex h-11 items-center overflow-hidden "
          style={getColumnStyle(column.width, column.grow)}
          role="cell"
        >
          <div
            className={`flex min-w-0 items-center overflow-hidden ${
              item.type === "last"
                ? "w-fit underline decoration-dotted decoration-1 underline-offset-2"
                : "h-full w-full"
            }`}
          >
            {column?.render
              ? column.render(row as T, rowIndex)
              : String(row[column.id])}
          </div>
        </div>
      ))}

      {actions.map((action) => (
        <div
          key={action.key}
          className="mr-1 shrink-0"
          style={{
            width: ACTION_COLUMN_WIDTH,
            minWidth: ACTION_COLUMN_WIDTH,
          }}
        >
          {item.type === "data" && (
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                action.handler(dataRow, rowIndex);
              }}
              icon={action.icon}
              className="h-8 w-8 rounded-full"
              size={action.iconSize}
              color={action.color}
              bgColor={COLOR_THEME.BG_COLOR}
              ariaLabel={action.label}
            />
          )}
        </div>
      ))}
    </div>
  );
}
export default typedMemo(Table);
