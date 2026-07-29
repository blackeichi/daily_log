import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { MdDelete, MdDragIndicator } from "react-icons/md";
import type { StockSearchResult } from "@/types/api";

export function SortableStockItem({
  item,
  onRemove,
}: {
  item: StockSearchResult;
  onRemove: (symbol: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.symbol });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex min-h-12 items-center border-b border-stone-200 bg-white px-2 last:border-b-0 ${
        isDragging ? "z-10 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center text-stone-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
        aria-label={`${item.name} 순서 변경`}
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator size={20} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1 px-2">
        <p className="truncate text-sm font-medium text-stone-800">
          {item.name}
        </p>
        <p className="text-xs text-stone-500">
          {item.symbol} · {item.market}
        </p>
      </div>
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center text-stone-500 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
        onClick={() => onRemove(item.symbol)}
        aria-label={`${item.name} 삭제`}
      >
        <MdDelete size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
