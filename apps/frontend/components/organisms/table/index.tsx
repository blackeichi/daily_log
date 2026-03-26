import { useEffect, useState } from "react";
import TableHeader from "./tableHeader";
import TableBody from "./tableBody";
import { TableProps } from "@/types/tableT";
import { typedMemo } from "@/lib/utils/component";
import { ComponentLoader } from "../../atoms/componentLoader";

function Table<T>({
  data,
  isLoading,
  headers,
  noHeader = false,
  onClick,
  onDelete,
  onDoubleClick,
  rowUniqueKey = "id",
  lastRow,
}: TableProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data || []);
  useEffect(() => {
    setTableData(data || []);
  }, [data]);
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md gap-1.5 border border-stone-300 h-full ${noHeader ? "" : "shadow-lg shadow-stone-500"}`}
    >
      {/* Table Header */}
      {!noHeader && (
        <TableHeader<T>
          tableHeader={headers}
          {...(onClick && { onClick })}
          {...(onDelete && { onDelete })}
          {...(onDoubleClick && { onDoubleClick })}
        />
      )}
      {/* Table Body */}
      {isLoading ? (
        <ComponentLoader />
      ) : (
        <div className="flex-1 overflow-hidden">
          <TableBody<T>
            tableData={tableData}
            tableHeader={headers}
            {...(onClick && { onClick })}
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
const TableComponent = typedMemo(Table, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.headers === nextProps.headers &&
    prevProps.isLoading === nextProps.isLoading
  );
});

export default TableComponent;
