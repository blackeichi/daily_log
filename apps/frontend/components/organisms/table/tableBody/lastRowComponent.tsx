import { Header } from "@/types/tableT";

export function LastRowComponent<T>({
  rowUniqueKey,
  row,
  tableHeader,
  onDelete,
  onDoubleClick,
}: {
  rowUniqueKey: string;
  row: Record<string, unknown>;
  tableHeader: Header[];
  onDelete?: (row: T, index: number) => void;
  onDoubleClick?: (row: T, index: number) => void;
}) {
  return (
    <div className={`w-full flex items-center pl-3 pr-1 rounded-sm font-bold`}>
      {tableHeader.map((property) => {
        return (
          <div
            id={`${property.id}${row[rowUniqueKey]}`}
            key={`${property.id}${row[rowUniqueKey]}`}
            className="h-11 pr-1 gap-1 flex items-center"
            style={{
              zIndex: 1,
              flex: property.width,
            }}
          >
            <div className="w-fit overflow-hidden flex items-center underline decoration-dotted decoration-1 underline-offset-2">
              <>{row[property.id]}</>
            </div>
          </div>
        );
      })}
      {onDoubleClick && <div className="w-8 sm:w-10 shrink-0"></div>}
      {onDelete && <div className="w-8 sm:w-10 shrink-0"></div>}
    </div>
  );
}
