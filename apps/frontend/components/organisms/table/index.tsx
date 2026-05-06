import { memo, useMemo } from "react";
import TableHeader from "./tableHeader";
import TableBody from "./tableBody";
import { TableProps } from "@/types/tableT";
import { ComponentLoader } from "../../atoms/componentLoader";

function Table<T>({
  data,
  isLoading,
  headers,
  noHeader = false,
  onEdit,
  onClick,
  onDelete,
  onDoubleClick,
  rowUniqueKey = "id",
  lastRow,
}: TableProps<T>) {
  const tableData = useMemo(() => data || [], [data]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md gap-1.5 border border-stone-300 h-full ${noHeader ? "" : "shadow-lg shadow-stone-500"}`}
    >
      {!noHeader && (
        <TableHeader<T>
          tableHeader={headers}
          {...(onEdit && { onEdit })}
          {...(onDelete && { onDelete })}
          {...(onDoubleClick && { onDoubleClick })}
        />
      )}
      {isLoading ? (
        <ComponentLoader />
      ) : (
        <div className="flex-1 overflow-hidden">
          <TableBody<T>
            tableData={tableData}
            tableHeader={headers}
            {...(onClick && { onClick })}
            {...(onEdit && { onEdit })}
            {...(onDelete && { onDelete })}
            rowUniqueKey={rowUniqueKey}
            {...(onDoubleClick && { onDoubleClick })}
            {...(lastRow && { lastRow })}
          />
        </div>
      )}
    </div>
  );
}
export default memo(Table);
