import TableHeaderRow from "./tableHeaderRow";
import { TableHeaderProps } from "@/types/tableT";
import { TABLE_BODY, TABLE_HEADER } from "@/constants/system";
import { typedMemo } from "@/lib/utils/component";

function TableHeader<T>({
  tableHeader,
  onClick,
  onDelete,
  onDoubleClick,
}: TableHeaderProps<T>) {
  const body =
    typeof document !== "undefined"
      ? document.getElementById(TABLE_BODY)
      : null;
  return (
    <>
      <table
        id={TABLE_HEADER}
        onScroll={(event: React.UIEvent<HTMLTableElement>) => {
          // header 스크롤 위치와 body 스크롤 위치 맞추기
          if (body) {
            body.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
        className={`p-1 pl-3 pr-1 noScrollBar overflow-scroll text-xs w-full h-[55px] shrink-0 select-none flex items-center bg-stone-700 shadow-stone-500 shadow-md text-white`}
      >
        <thead className="w-full h-full table select-none">
          <tr className="w-full h-full flex items-center font-semibold relative">
            {tableHeader.map((row) => (
              <TableHeaderRow key={row.id} row={row} />
            ))}
            {onClick && <td className="w-8 sm:w-10 shrink-0" />}
            {onDelete && <td className="w-8 sm:w-10 shrink-0" />}
            {onDoubleClick && <td className="w-8 sm:w-10 shrink-0" />}
          </tr>
        </thead>
      </table>
    </>
  );
}

const MemoizedTableHeader = typedMemo(TableHeader);

export default MemoizedTableHeader;
