import { memo } from "react";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlockComponent({ className = "" }: SkeletonBlockProps) {
  return (
    <div
      className={`animate-pulse rounded bg-stone-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export const SkeletonBlock = memo(SkeletonBlockComponent);
