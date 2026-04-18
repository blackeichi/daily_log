import { memo } from "react";
import { CHART_CARD } from "../constants";

const ChartCard = ({
  title,
  badge,
  description,
  loading,
  empty,
  children,
}: {
  title: string;
  badge: string;
  description: string;
  loading: boolean;
  empty: boolean;
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
        <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          통계를 불러오는 중...
        </div>
      ) : empty ? (
        <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          최근 30일 데이터가 없습니다.
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default memo(ChartCard);
