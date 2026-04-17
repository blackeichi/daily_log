import { EChartsOption } from "echarts";
import { CalorieStatusLabel } from "./types";

export function getCalorieStatus(
  totalCalorie: number,
  goalCalorie: number,
  maximumCalorie: number,
): CalorieStatusLabel {
  if (totalCalorie <= goalCalorie) return "목표 달성";
  if (totalCalorie <= maximumCalorie) return "일일섭취칼로리 달성";
  return "실패";
}

export function formatPercent(value: number, total: number): string {
  if (!total) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getNumericValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && typeof value[0] === "number") return value[0];
  return 0;
}

export function donutBaseOption(
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
