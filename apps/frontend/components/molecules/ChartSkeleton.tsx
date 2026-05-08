import { memo } from "react";
import { SkeletonBlock } from "../atoms/SkeletonBlock";

function ChartSkeletonComponent() {
  return (
    <div className="flex h-80 flex-col items-center justify-center gap-4 rounded-lg bg-stone-50 p-6">
      <SkeletonBlock className="h-32 w-32 rounded-full" />
      <div className="flex w-full max-w-xs flex-col gap-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export const ChartSkeleton = memo(ChartSkeletonComponent);
