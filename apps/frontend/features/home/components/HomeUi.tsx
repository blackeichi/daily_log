"use client";

import dynamic from "next/dynamic";
import QueryRetry from "@/components/molecules/QueryRetry";
import { ChartSkeleton } from "@/components/molecules/ChartSkeleton";
import { EmptyState } from "@/components/atoms/EmptyState";
import { HomeUIProps } from "../types";
import { useHomePage } from "../hooks/useHomePage";
import ChartCard from "./ChartCard";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
});

export default function HomeUI({ initialData }: HomeUIProps) {
  const {
    message,
    summary,
    isLoading,
    isError,
    isRetrying,
    refetchHomeData,
    calorieStatusData,
    scoreDistributionData,
    calorieStatusOption,
    scoreDistributionOption,
    calorieTrendOption,
    hasCalorieTrendData,
    calorieStatusEvents,
    scoreDistributionEvents,
    calorieTrendEvents,
    chartCardClassName,
  } = useHomePage(initialData);

  return (
    <div className="w-full min-h-screen max-w-200">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-lg bg-white shadow-lg shadow-stone-500">
          <div className="flex items-center gap-3 bg-stone-700 p-4 py-6 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-blue-100 text-lg sm:h-10 sm:w-10 sm:text-xl">
              😃
            </div>
            <div>
              <h2 className="font-semibold">AI가 전하는 오늘의 한마디</h2>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 border border-stone-200 bg-white p-6 text-sm sm:gap-6 sm:p-8 sm:text-base">
            <p className="whitespace-pre-line text-center leading-4 sm:leading-6">
              {message}
            </p>
          </div>
        </section>

        {isError ? (
          <QueryRetry
            message="홈 통계 조회에 실패했습니다."
            onRetry={refetchHomeData}
            isRetrying={isRetrying}
          />
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="최근 30일 칼로리 상태 비율"
                badge={`평균 섭취 칼로리 : ${summary.avgCalorie} kcal`}
                description="목표 달성 / 일일섭취칼로리 달성 / 실패 비율을 확인할 수 있어요."
                loading={isLoading}
                empty={!calorieStatusData.some((item) => item.value > 0)}
              >
                <ReactECharts
                  option={calorieStatusOption}
                  style={{ height: 360 }}
                  onEvents={calorieStatusEvents}
                />
              </ChartCard>

              <ChartCard
                title="최근 30일 로그 점수 분포"
                badge={`평균 기분 점수 : ${summary.avgScore}`}
                description="각 점수 구간을 누르면 해당 로그 목록을 볼 수 있어요."
                loading={isLoading}
                empty={!scoreDistributionData.some((item) => item.value > 0)}
              >
                <ReactECharts
                  option={scoreDistributionOption}
                  style={{ height: 360 }}
                  onEvents={scoreDistributionEvents}
                />
              </ChartCard>
            </section>

            <section className={chartCardClassName}>
              <div className="mb-4 flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                  최근 30일 칼로리 추이
                </h3>
                <p className="text-sm text-stone-500">
                  특정 날짜 포인트를 누르면 해당 날짜 식단 기록을 바로 열 수
                  있어요.
                </p>
              </div>

              {isLoading ? (
                <ChartSkeleton />
              ) : !hasCalorieTrendData ? (
                <EmptyState
                  title="최근 30일 데이터가 없습니다."
                  description="식단을 추가하면 칼로리 추이를 확인할 수 있어요."
                  className="h-80 bg-stone-50"
                />
              ) : (
                <ReactECharts
                  option={calorieTrendOption}
                  style={{ height: 320 }}
                  onEvents={calorieTrendEvents}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
