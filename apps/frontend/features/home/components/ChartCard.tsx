import { memo } from "react";
import { ChartSkeleton } from "@/components/molecules/ChartSkeleton";
import { EmptyState } from "@/components/atoms/EmptyState";
import { CHART_CARD } from "../constants";

const ChartCard = ({
  title,
  badge,
  description,
  loading,
  empty,
  emptyMessage = "최근 30일 데이터가 없습니다.",
  children,
}: {
  title: string;
  badge: string;
  description: string;
  loading: boolean;
  empty: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className={CHART_CARD}>
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
          {title}
        </h3>
        <p className="text-sm bg-stone-600 text-white p-0.5 px-2 rounded w-fit">
          {badge}
        </p>
        <p className="text-sm text-stone-500">{description}</p>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : empty ? (
        <EmptyState title={emptyMessage} className="h-80 bg-stone-50" />
      ) : (
        children
      )}
    </section>
  );
};

export default memo(ChartCard);
