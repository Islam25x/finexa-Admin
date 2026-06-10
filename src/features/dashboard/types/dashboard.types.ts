export type MetricSummary = {
  title: string;
  value: string;
  helper: string;
  tone: "blue" | "green" | "violet" | "red";
};

export type FinancialPoint = {
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export type AiUsageItem = {
  label: string;
  count: number;
  amount: number;
  color: string;
};

export type BillsSummaryItem = {
  label: string;
  value: string;
};

export type JobHealthSummary = {
  latestJob: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  failedLast24Hours: number;
};

export type RecentActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  occurredAt: string;
  tone: "blue" | "green" | "violet";
};

export type DashboardSummary = {
  metrics: MetricSummary[];
  financial: FinancialPoint[];
  aiUsage: AiUsageItem[];
  bills: BillsSummaryItem[];
  jobHealth: JobHealthSummary;
  recentActivity: RecentActivityItem[];
};
