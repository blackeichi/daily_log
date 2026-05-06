import { MdEdit } from "react-icons/md";
import IconButton from "../../../../molecules/iconButton";
import TableData from "./tableData";
import { TableRowProps } from "@/types/tableT";
import { COLOR_THEME } from "@/constants/system";
import { FaTrash } from "react-icons/fa";
import { typedMemo } from "@/lib/utils/component";
import { useMemo } from "react";

function BodyRow<T>({
  rowUniqueKey,
  row,
  index,
  tableHeader,
  onClick,
  onEdit,
  onDelete,
  onDoubleClick,
}: TableRowProps<T>) {
  const cursorStyle = useMemo(() => {
    return onClick
      ? "cursor-pointer hover:underline hover:underline-offset-2"
      : "";
  }, [onClick]);
  return (
    <div
      className={`w-full flex items-center border-b border-b-stone-300 pl-3 pr-1 hover:bg-stone-200 transition-[background-color] relative ${cursorStyle}`}
      onClick={() => {
        if (onClick) {
          onClick(row as T, index);
        }
      }}
      onDoubleClick={() => {
        if (onDoubleClick) {
          onDoubleClick(row as T, index);
        }
      }}
    >
      <TableData
        row={row}
        rowUniqueKey={rowUniqueKey}
        tableHeader={tableHeader}
      />
      {onEdit && (
        <div className="w-8 sm:w-10 shrink-0 mr-1">
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row as T, index);
            }}
            icon={MdEdit}
            className="rounded-full w-8 h-8"
            size={20}
            color={COLOR_THEME.DARK_GRAY}
            bgColor={COLOR_THEME.BG_COLOR}
          />
        </div>
      )}
      {onDoubleClick && (
        <div className="w-8 sm:w-10 shrink-0 mr-1">
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onDoubleClick(row as T, index);
            }}
            icon={MdEdit}
            className="rounded-full w-8 h-8"
            size={20}
            color={COLOR_THEME.DARK_GRAY}
            bgColor={COLOR_THEME.BG_COLOR}
          />
        </div>
      )}
      {onDelete && (
        <div className="w-8 sm:w-10 shrink-0">
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row as T, index);
            }}
            icon={FaTrash}
            className="rounded-full w-8 h-8"
            size={15}
            color={COLOR_THEME.RED_COLOR}
            bgColor={COLOR_THEME.BG_COLOR}
          />
        </div>
      )}
    </div>
  );
}

const MemoizedBodyRow = typedMemo(BodyRow, (prevProps, nextProps) => {
  return (
    prevProps.row === nextProps.row &&
    prevProps.index === nextProps.index &&
    prevProps.tableHeader === nextProps.tableHeader &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onDoubleClick === nextProps.onDoubleClick
  );
});

export default MemoizedBodyRow;
