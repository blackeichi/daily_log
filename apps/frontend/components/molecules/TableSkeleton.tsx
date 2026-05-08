import { memo } from "react";
import { SkeletonBlock } from "../atoms/SkeletonBlock";

type TableSkeletonProps = {
  rowCount?: number;
};

function TableSkeletonComponent({ rowCount = 8 }: TableSkeletonProps) {
  return (
    <div className="flex flex-1 flex-col gap-1 p-2">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          key={index}
          className="flex h-11 items-center gap-3 border-b border-b-stone-100 px-2"
        >
          <SkeletonBlock className="h-4 w-10" />
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export const TableSkeleton = memo(TableSkeletonComponent);
