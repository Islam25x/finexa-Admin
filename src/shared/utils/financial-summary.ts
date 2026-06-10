import type { MetricTrendPresentation } from "./metric-trend";
import {
  createStaticTrendPresentation,
  formatDashboardTrend,
} from "./metric-trend";

export type FinancialMetricId = "balance" | "income" | "expenses" | "savings";

export type FinancialTrendInput = {
  value: number;
  trend: "up" | "down" | "neutral";
};

export type FinancialSummaryData = {
  availableBalance?: number;
  income?: number;
  expenses?: number;
  savings?: number;
  balanceTrend?: FinancialTrendInput | null;
  incomeTrend?: FinancialTrendInput | null;
  expensesTrend?: FinancialTrendInput | null;
  savingsTrend?: FinancialTrendInput | null;
};

export type FinancialSummaryViewState = "loading" | "error" | "ready";

export type FinancialMetricActionMap = Partial<
  Record<FinancialMetricId, () => void>
>;

export type FinancialMetricCardModel = {
  id: FinancialMetricId;
  title: string;
  value: number | string;
  trend: MetricTrendPresentation;
  showArrow: boolean;
  onArrowClick?: () => void;
};

const FINANCIAL_METRIC_DEFINITIONS: Array<{
  id: FinancialMetricId;
  title: string;
  showArrow: boolean;
}> = [
  {
    id: "balance",
    title: "Available Balance",
    showArrow: true,
  },
  {
    id: "income",
    title: "Income",
    showArrow: true,
  },
  {
    id: "expenses",
    title: "Expenses",
    showArrow: true,
  },
  {
    id: "savings",
    title: "Savings",
    showArrow: false,
  },
];

function getMetricValue(
  value: number | undefined,
  state: FinancialSummaryViewState,
): number | string {
  if (typeof value === "number") {
    return value;
  }

  if (state === "loading") {
    return "...";
  }

  if (state === "error") {
    return "--";
  }

  return 0;
}

function getMetricTrend(
  trend: FinancialTrendInput | null | undefined,
  state: FinancialSummaryViewState,
): MetricTrendPresentation {
  if (state === "loading") {
    return createStaticTrendPresentation("Loading...", "neutral");
  }

  if (state === "error") {
    return createStaticTrendPresentation("Unavailable", "neutral");
  }

  if (!trend) {
    return createStaticTrendPresentation("No trend data", "neutral");
  }

  return formatDashboardTrend(trend);
}

export function buildFinancialMetricCardModels(
  summary: FinancialSummaryData | undefined,
  state: FinancialSummaryViewState,
  actions: FinancialMetricActionMap = {},
): FinancialMetricCardModel[] {
  return FINANCIAL_METRIC_DEFINITIONS.map((definition) => {
    const valueByMetric: Record<FinancialMetricId, number | undefined> = {
      balance: summary?.availableBalance,
      income: summary?.income,
      expenses: summary?.expenses,
      savings: summary?.savings,
    };
    const trendByMetric: Record<
      FinancialMetricId,
      FinancialTrendInput | null | undefined
    > = {
      balance: summary?.balanceTrend,
      income: summary?.incomeTrend,
      expenses: summary?.expensesTrend,
      savings: summary?.savingsTrend,
    };

    return {
      id: definition.id,
      title: definition.title,
      value: getMetricValue(valueByMetric[definition.id], state),
      trend: getMetricTrend(trendByMetric[definition.id], state),
      showArrow: definition.showArrow,
      onArrowClick: actions[definition.id],
    };
  });
}
