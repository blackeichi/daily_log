"use client";

import moment from "moment";
import { useCallback, useMemo } from "react";
import type { EChartsOption } from "echarts";
import { useSetAtom } from "jotai";
import { modalAtom } from "@/lib/atom";
import { useAllDiet } from "@/lib/hooks/useDiet";
import { useLogs } from "@/lib/hooks/useLog";
import { MODAL_STATE } from "@/constants/system";
import { CHART_CARD, DATE_RANGE_DAYS, DEFAULT_MESSAGE } from "../constants";
import { CalorieStatusLabel, ScoreLabel } from "../types";
import { donutBaseOption, getCalorieStatus, getNumericValue } from "../utils";

export function useHomePage(initialMessage?: string) {
  const message = initialMessage?.trim() || DEFAULT_MESSAGE;

  const setModal = useSetAtom(modalAtom);

  const endDate = moment().format("YYYY-MM-DD");
  const startDate = moment()
    .subtract(DATE_RANGE_DAYS, "days")
    .format("YYYY-MM-DD");

  const {
    data: calories = [],
    isLoading: caloriesLoading,
    isError: caloriesError,
    isFetching: caloriesFetching,
    refetch: refetchCalories,
  } = useAllDiet(startDate, endDate);
  const {
    data: logs = [],
    isLoading: logsLoading,
    isError: logsError,
    isFetching: logsFetching,
    refetch: refetchLogs,
  } = useLogs(startDate, endDate);

  const calorieStatusData = useMemo(() => {
    const counts: Record<CalorieStatusLabel, number> = {
      "목표 달성": 0,
      "일일섭취칼로리 달성": 0,
      실패: 0,
    };

    calories.forEach((item) => {
      const status = getCalorieStatus(
        item.totalCalorie,
        item.goalCalorie,
        item.maximumCalorie,
      );
      counts[status] += 1;
    });

    return (Object.entries(counts) as [CalorieStatusLabel, number][]).map(
      ([name, value]) => ({ name, value }),
    );
  }, [calories]);

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
        goalCalorie: item?.goalCalorie ?? null,
        maximumCalorie: item?.maximumCalorie ?? null,
      };
    });
  }, [calories, startDate]);

  const hasCalorieTrendData = useMemo(
    () => calorieTrend.some((item) => item.totalCalorie !== null),
    [calorieTrend],
  );

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

  const calorieStatusOption = useMemo(
    () => donutBaseOption("칼로리 상태", calorieStatusData, "일"),
    [calorieStatusData],
  );

  const scoreDistributionOption = useMemo(
    () => donutBaseOption("점수 분포", scoreDistributionData, "개"),
    [scoreDistributionData],
  );

  const calorieTrendOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: unknown) => {
          const list = params as Array<{
            axisValue?: string;
            data?: unknown;
            marker?: string;
            seriesName?: string;
          }>;
          const first = list?.[0];
          const values = list
            .filter(
              (item) => item.data !== null && item.data !== undefined,
            )
            .map(
              (item) =>
                `${item.marker ?? ""}${item.seriesName ?? ""}: ${getNumericValue(item.data)} kcal`,
            );

          return `${first?.axisValue ?? ""}<br/>${
            values.length ? values.join("<br/>") : "기록 없음"
          }`;
        },
      },
      grid: { left: 36, right: 20, top: 30, bottom: 60 },
      xAxis: {
        type: "category",
        data: calorieTrend.map((item) => item.shortDate),
        axisLabel: { interval: 4 },
      },
      yAxis: {
        type: "value",
      },
      legend: {
        bottom: 0,
      },
      series: [
        {
          name: "섭취 칼로리",
          type: "line",
          smooth: true,
          connectNulls: false,
          data: calorieTrend.map((item) => item.totalCalorie),
          symbolSize: 8,
        },
        {
          name: "목표 칼로리",
          type: "line",
          connectNulls: false,
          data: calorieTrend.map((item) => item.goalCalorie),
          symbol: "none",
          lineStyle: { type: "dashed" },
        },
        {
          name: "최대 칼로리",
          type: "line",
          connectNulls: false,
          data: calorieTrend.map((item) => item.maximumCalorie),
          symbol: "none",
          lineStyle: { type: "dotted" },
        },
      ],
    } as EChartsOption;
  }, [calorieTrend]);

  const openCalorieStatusModal = useCallback(
    (label: CalorieStatusLabel) => {
      const filtered = calories.filter((item) => {
        return (
          getCalorieStatus(
            item.totalCalorie,
            item.goalCalorie,
            item.maximumCalorie,
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
    [calories, setModal],
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

  const refetchHomeData = useCallback(() => {
    void refetchCalories();
    void refetchLogs();
  }, [refetchCalories, refetchLogs]);

  return {
    message,
    summary,
    isLoading: caloriesLoading || logsLoading,
    isError: caloriesError || logsError,
    isRetrying: caloriesFetching || logsFetching,
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
    chartCardClassName: CHART_CARD,
  };
}
