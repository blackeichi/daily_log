import { Header } from "@/app/types/tableT";

export default function TableHeaderRow({ row }: { row: Header }) {
  return (
    <td
      className="relative h-full flex items-center pr-1"
      style={{ flex: row.width }}
    >
      <span className={`rounded-sm flex gap-2 items-center`}>
        <span className={`decoration-[3px] decoration-[rgba(0,0,0,0.6)]`}>
          {row.label}
        </span>
      </span>
    </td>
  );
}
