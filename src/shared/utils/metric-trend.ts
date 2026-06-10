export type MetricTrendState = "positive" | "negative" | "neutral";

export type MetricTrendPresentation = {
  state: MetricTrendState;
  label: string;
};

type DashboardTrendInput = {
  value: number;
  trend: "up" | "down" | "neutral";
};

type DashboardTrendOptions = {
  neutralLabel?: string;
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function isNeutralChange(value: number): boolean {
  return Math.abs(value) < 0.05;
}

function formatSignedPercentage(value: number, periodLabel: string): string {
  const absoluteValue = percentFormatter.format(Math.abs(value));
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${absoluteValue}% ${periodLabel}`;
}

export function createStaticTrendPresentation(
  label: string,
  state: MetricTrendState = "neutral",
): MetricTrendPresentation {
  return {
    state,
    label,
  };
}

export function formatDashboardTrend(
  trend: DashboardTrendInput,
  options?: DashboardTrendOptions,
): MetricTrendPresentation {
  if (trend.trend === "neutral" || !Number.isFinite(trend.value) || isNeutralChange(trend.value)) {
    return {
      state: "neutral",
      label: options?.neutralLabel ?? "0% this month",
    };
  }

  return {
    state: trend.trend === "up" ? "positive" : "negative",
    label: formatSignedPercentage(
      trend.trend === "down" ? -Math.abs(trend.value) : Math.abs(trend.value),
      "this month",
    ),
  };
}
