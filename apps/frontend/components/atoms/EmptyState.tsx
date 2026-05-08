import { memo } from "react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

function EmptyStateComponent({
  title = "데이터가 없습니다.",
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-md px-4 py-6 text-center text-sm text-stone-500 ${className}`}
    >
      <p className="font-medium text-stone-600">{title}</p>
      {description ? (
        <p className="text-xs text-stone-400">{description}</p>
      ) : null}
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);
