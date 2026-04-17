"use client";

import dynamic from "next/dynamic";
import moment from "moment";
import { useCallback, useMemo } from "react";
import type { EChartsOption } from "echarts";
import { useAtomValue, useSetAtom } from "jotai";
import { modalAtom, userAtom } from "@/lib/atom";
import { useAllDiet } from "@/lib/hooks/useDiet";
import { useLogs } from "@/lib/hooks/useLog";
import { MODAL_STATE } from "@/constants/system";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
});

interface HomeUIProps {
  initialData?: string;
}

type ScoreLabel = "1점" | "2점" | "3점" | "4점" | "5점" | "미평가";
type CalorieStatusLabel = "목표 달성" | "일일섭취칼로리 달성" | "실패";

const CHART_CARD =
  "rounded-lg bg-white p-5 pb-4 shadow-lg shadow-stone-500 border border-stone-100";
const DATE_RANGE_DAYS = 29;
const DEFAULT_MESSAGE =
  "오늘도 충분히 잘하고 있어요! \n 천천히 가도 괜찮아요. 😉";

function getCalorieStatus(
  totalCalorie: number,
  goalCalorie: number,
  maximumCalorie: number,
): CalorieStatusLabel {
  if (totalCalorie <= goalCalorie) return "목표 달성";
  if (totalCalorie <= maximumCalorie) return "일일섭취칼로리 달성";
  return "실패";
}

function formatPercent(value: number, total: number): string {
  if (!total) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function getNumericValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && typeof value[0] === "number") return value[0];
  return 0;
}

function donutBaseOption(
  title: string,
  data: { name: string; value: number }[],
  unit: string,
): EChartsOption {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { name?: string; value?: unknown };
        const name = p.name ?? "";
        const value = getNumericValue(p.value);
        return `${name}<br/>${value}${unit} (${formatPercent(value, total)})`;
      },
    },
    legend: {
      bottom: 0,
      left: "center",
      itemWidth: 14,
      itemHeight: 14,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: title,
        type: "pie",
        radius: ["46%", "66%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        minAngle: 8,
        stillShowZeroSum: false,
        label: {
          show: true,
          position: "outer",
          alignTo: "edge",
          edgeDistance: 10,
          bleedMargin: 6,
          fontSize: 12,
          lineHeight: 16,
          formatter: (params: unknown) => {
            const p = params as { name?: string; value?: unknown };
            const name = p.name ?? "";
            const value = getNumericValue(p.value);

            if (value <= 0) return "";
            return `${name}\n${formatPercent(value, total)}`;
          },
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 8,
        },
        labelLayout: {
          hideOverlap: true,
          moveOverlap: "shiftY",
        },
        emphasis: {
          scale: true,
          scaleSize: 4,
        },
        data,
      },
    ],
  };
}

export default function HomeUI({ initialData }: HomeUIProps) {
  const message = initialData?.trim() || DEFAULT_MESSAGE;

  const user = useAtomValue(userAtom);
  const setModal = useSetAtom(modalAtom);

  const endDate = moment().format("YYYY-MM-DD");
  const startDate = moment()
    .subtract(DATE_RANGE_DAYS, "days")
    .format("YYYY-MM-DD");

  const { data: calories = [], isLoading: caloriesLoading } = useAllDiet(
    startDate,
    endDate,
  );
  const { data: logs = [], isLoading: logsLoading } = useLogs(
    startDate,
    endDate,
  );

  const calorieStatusData = useMemo(() => {
    if (!user) return [];

    const counts: Record<CalorieStatusLabel, number> = {
      "목표 달성": 0,
      "일일섭취칼로리 달성": 0,
      실패: 0,
    };

    calories.forEach((item) => {
      const status = getCalorieStatus(
        item.totalCalorie,
        user.goalCalorie,
        user.maximumCalorie,
      );
      counts[status] += 1;
    });

    return (Object.entries(counts) as [CalorieStatusLabel, number][]).map(
      ([name, value]) => ({ name, value }),
    );
  }, [calories, user]);

  const scoreDistributionData = useMemo(() => {
    const counts: Record<ScoreLabel, number> = {
      "1점": 0,
      "2점": 0,
      "3점": 0,
      "4점": 0,
      "5점": 0,
      미평가: 0,
    };

    logs.forEach((log) => {
      if (!log.score) {
        counts["미평가"] += 1;
        return;
      }
      counts[`${log.score}점` as ScoreLabel] += 1;
    });

    return (Object.entries(counts) as [ScoreLabel, number][]).map(
      ([name, value]) => ({ name, value }),
    );
  }, [logs]);

  const calorieTrend = useMemo(() => {
    const map = new Map(calories.map((item) => [item.date, item]));

    return Array.from({ length: DATE_RANGE_DAYS + 1 }, (_, index) => {
      const date = moment(startDate).add(index, "days").format("YYYY-MM-DD");
      const item = map.get(date);

      return {
        date,
        shortDate: moment(date).format("MM/DD"),
        totalCalorie: item?.totalCalorie ?? null,
      };
    });
  }, [calories, startDate]);

  const summary = useMemo(() => {
    const recordedCalorieDays = calories.length;
    const recordedLogDays = logs.length;

    const avgCalorie = recordedCalorieDays
      ? Math.round(
          calories.reduce((acc, cur) => acc + cur.totalCalorie, 0) /
            recordedCalorieDays,
        )
      : 0;

    const scoredLogs = logs.filter((log) => !!log.score);
    const avgScore = scoredLogs.length
      ? (
          scoredLogs.reduce((acc, cur) => acc + (cur.score ?? 0), 0) /
          scoredLogs.length
        ).toFixed(1)
      : "-";

    return {
      recordedCalorieDays,
      recordedLogDays,
      avgCalorie,
      avgScore,
    };
  }, [calories, logs]);

  const calorieStatusOption = useMemo(() => {
    return donutBaseOption("칼로리 상태", calorieStatusData, "일");
  }, [calorieStatusData]);

  const scoreDistributionOption = useMemo(() => {
    return donutBaseOption("점수 분포", scoreDistributionData, "개");
  }, [scoreDistributionData]);

  const calorieTrendOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: unknown) => {
          const list = params as Array<{ axisValue?: string; data?: unknown }>;
          const first = list?.[0];
          const value = getNumericValue(first?.data);
          const hasValue = first?.data !== null && first?.data !== undefined;

          return `${first?.axisValue ?? ""}<br/>${
            hasValue ? value : "기록 없음"
          }`;
        },
      },
      grid: { left: 36, right: 20, top: 30, bottom: 40 },
      xAxis: {
        type: "category",
        data: calorieTrend.map((item) => item.shortDate),
        axisLabel: { interval: 4 },
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "섭취 칼로리",
          type: "line",
          smooth: true,
          connectNulls: false,
          data: calorieTrend.map((item) => item.totalCalorie),
          symbolSize: 8,
          markLine: user
            ? {
                silent: true,
                data: [
                  { yAxis: user.goalCalorie, name: "goal" },
                  { yAxis: user.maximumCalorie, name: "maximum" },
                ],
              }
            : undefined,
        },
      ],
    } as EChartsOption;
  }, [calorieTrend, user]);

  const openCalorieStatusModal = useCallback(
    (label: CalorieStatusLabel) => {
      if (!user) return;

      const filtered = calories.filter((item) => {
        return (
          getCalorieStatus(
            item.totalCalorie,
            user.goalCalorie,
            user.maximumCalorie,
          ) === label
        );
      });

      setModal({
        id: MODAL_STATE.VIEW_HOME_CHART_DETAIL,
        data: {
          title: `최근 30일 칼로리 상태 - ${label}`,
          kind: "calorie",
          items: filtered,
        },
      });
    },
    [user, calories, setModal],
  );

  const openScoreModal = useCallback(
    (label: ScoreLabel) => {
      const filtered = logs.filter((log) => {
        if (label === "미평가") return !log.score;
        return `${log.score}점` === label;
      });

      setModal({
        id: MODAL_STATE.VIEW_HOME_CHART_DETAIL,
        data: {
          title: `최근 30일 로그 점수 - ${label}`,
          kind: "log",
          items: filtered,
        },
      });
    },
    [logs, setModal],
  );

  const handleCalorieTrendClick = useCallback(
    (params: { dataIndex: number }) => {
      const target = calorieTrend[params.dataIndex];
      if (!target?.date || target.totalCalorie == null) return;

      setModal({
        id: MODAL_STATE.EDIT_CALORIES,
        data: target.date,
      });
    },
    [calorieTrend, setModal],
  );

  const calorieStatusEvents = useMemo(
    () => ({
      click: (params: { name: CalorieStatusLabel }) =>
        openCalorieStatusModal(params.name),
    }),
    [openCalorieStatusModal],
  );

  const scoreDistributionEvents = useMemo(
    () => ({
      click: (params: { name: ScoreLabel }) => openScoreModal(params.name),
    }),
    [openScoreModal],
  );

  const calorieTrendEvents = useMemo(
    () => ({
      click: handleCalorieTrendClick,
    }),
    [handleCalorieTrendClick],
  );

  const isLoading = caloriesLoading || logsLoading;

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

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            label="평균 섭취 칼로리"
            value={`${summary.avgCalorie} kcal`}
          />
          <SummaryCard label="평균 점수" value={`${summary.avgScore}`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="최근 30일 칼로리 상태 비율"
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

        <section className={CHART_CARD}>
          <div className="mb-4 flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
              최근 30일 칼로리 추이
            </h3>
            <p className="text-sm text-stone-500">
              특정 날짜 포인트를 누르면 해당 날짜 식단 기록을 바로 열 수 있어요.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              통계를 불러오는 중...
            </div>
          ) : (
            <ReactECharts
              option={calorieTrendOption}
              style={{ height: 320 }}
              onEvents={calorieTrendEvents}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  loading,
  empty,
  children,
}: {
  title: string;
  description: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={CHART_CARD}>
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
          {title}
        </h3>
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
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-white px-4 py-5 shadow-lg shadow-stone-500">
      <div className="text-xs text-stone-500 sm:text-sm">{label}</div>
      <div className="mt-2 text-lg font-semibold text-stone-800 sm:text-xl">
        {value}
      </div>
    </div>
  );
}
