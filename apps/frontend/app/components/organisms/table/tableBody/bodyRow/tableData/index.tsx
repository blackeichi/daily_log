import { memo } from "react";
import TooltipData from "./TooltipData";
import { Header } from "@/app/types/tableT";

function TableData({
  row,
  rowUniqueKey,
  tableHeader,
}: {
  row: Record<string, unknown>;
  rowUniqueKey: string;
  tableHeader: Header[];
}) {
  return (
    <>
      {tableHeader.map((property) => {
        return (
          <div
            id={`${property.id}${row[rowUniqueKey]}`}
            key={`${property.id}${row[rowUniqueKey]}`}
            className="h-11 pr-1 gap-1 flex items-center box-border overflow-hidden"
            style={{
              zIndex: 1,
              flex: property.width,
            }}
          >
            <div className="w-full h-full overflow-hidden flex items-center">
              {row[property.id] !== null && property.id === "title" ? (
                <TooltipData row={row} property={property} />
              ) : (
                <>{row[property.id]}</>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default memo(TableData);
