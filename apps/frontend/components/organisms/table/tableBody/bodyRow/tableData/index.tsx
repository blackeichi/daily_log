import { memo } from "react";
import TooltipData from "./TooltipData";
import { Header } from "@/types/tableT";

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
              ) : property.id === "score" &&
                typeof row[property.id] === "number" ? (
                <div className="flex items-center gap-2 sm:text-lg text-base">
                  {row[property.id] === 1 && "😢"}
                  {row[property.id] === 2 && "😕"}
                  {row[property.id] === 3 && "😐"}
                  {row[property.id] === 4 && "🙂"}
                  {row[property.id] === 5 && "😄"}
                </div>
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
