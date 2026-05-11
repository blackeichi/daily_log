import { ACTION_COLUMN_WIDTH } from "./constants";
import { Header } from "./table";

export function getColumnStyle(width: number, grow = 0) {
  return {
    minWidth: width,
    flex: `${grow} 0 ${width}px`,
  };
}

export function getTableMinWidth<T>(columns: Header<T>[], actionCount: number) {
  return (
    columns.reduce((sum, column) => sum + column.width, 0) +
    actionCount * ACTION_COLUMN_WIDTH
  );
}

export function getTableWidthStyle(tableMinWidth: number) {
  return {
    width: `max(100%, ${tableMinWidth}px)`,
  };
}
