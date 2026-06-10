import { requestJson } from "../../../infrastructure/api/http";
import { unwrapEnvelope } from "../../../shared/utils/api-response.utils";
import type {
  AiUsageItem,
  BillsSummaryItem,
  DashboardSummary,
  FinancialPoint,
  JobHealthSummary,
  MetricSummary,
  RecentActivityItem,
} from "../types/dashboard.types";

const AI_COLORS = [
  "var(--color-primary)",
  "var(--color-primary-hover)",
  "var(--color-text-secondary)",
  "var(--color-text-muted)",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatMoney(value: number): string {
  return `${formatNumber(value)} `;
}

function mapMetrics(data: Record<string, unknown>): MetricSummary[] {
  const users = isRecord(data.users) ? data.users : {};
  const financial = isRecord(data.financial) ? data.financial : {};
  const bills = isRecord(data.bills) ? data.bills : {};
  const ai = isRecord(data.aiUsage) ? data.aiUsage : {};

  return [
    {
      title: "Total Users",
      value: formatNumber(typeof users.totalUsers === "number" ? users.totalUsers : 0),
      helper: `${formatNumber(typeof users.newThisMonth === "number" ? users.newThisMonth : 0)} this month`,
      tone: "blue",
    },
    {
      title: "Active Users",
      value: formatNumber(typeof users.activeUsers === "number" ? users.activeUsers : 0),
      helper: "Active accounts",
      tone: "green",
    },
    {
      title: "Total Transactions",
      value: formatNumber(typeof financial.totalTransactions === "number" ? financial.totalTransactions : 0),
      helper: `${formatNumber(typeof financial.transactionsThisMonth === "number" ? financial.transactionsThisMonth : 0)} this month`,
      tone: "violet",
    },
    {
      title: "AI Transactions",
      value: formatNumber(typeof ai.totalAiTransactions === "number" ? ai.totalAiTransactions : 0),
      helper: `${formatNumber(typeof ai.aiTransactionsThisMonth === "number" ? ai.aiTransactionsThisMonth : 0)} this month`,
      tone: "blue",
    },
  ];
}

function mapFinancial(): FinancialPoint[] {
  return [];
}

function mapAiUsage(data: Record<string, unknown>): AiUsageItem[] {
  const ai = isRecord(data.aiUsage) ? data.aiUsage : {};
  const rows = Array.isArray(ai.sourceStats) ? ai.sourceStats : [];

  return rows.filter(isRecord).map((row, index) => ({
    label: typeof row.source === "string" ? row.source : "",
    count: typeof row.count === "number" ? row.count : 0,
    amount: typeof row.totalAmount === "number" ? row.totalAmount : 0,
    color: AI_COLORS[index % AI_COLORS.length],
  }));
}

function mapBills(data: Record<string, unknown>): BillsSummaryItem[] {
  const bills = isRecord(data.bills) ? data.bills : {};

  return [
    { label: "Total Bill Series", value: formatNumber(typeof bills.totalBillSeries === "number" ? bills.totalBillSeries : 0) },
    { label: "Active Bill Series", value: formatNumber(typeof bills.activeBillSeries === "number" ? bills.activeBillSeries : 0) },
    { label: "Scheduled", value: formatNumber(typeof bills.scheduledOccurrences === "number" ? bills.scheduledOccurrences : 0) },
    { label: "Paid", value: formatNumber(typeof bills.paidOccurrences === "number" ? bills.paidOccurrences : 0) },
    { label: "Due This Week", value: formatNumber(typeof bills.dueThisWeek === "number" ? bills.dueThisWeek : 0) },
    { label: "Paid This Month", value: formatNumber(typeof bills.paidThisMonth === "number" ? bills.paidThisMonth : 0) },
    { label: "Expected This Month", value: formatMoney(typeof bills.expectedThisMonth === "number" ? bills.expectedThisMonth : 0) },
  ];
}

function mapJobHealth(data: Record<string, unknown>): JobHealthSummary {
  const jobHealth = isRecord(data.jobHealth) ? data.jobHealth : {};

  const duration = computeDuration(
    typeof jobHealth.latestJobStartedAt === "string" ? jobHealth.latestJobStartedAt : undefined,
    typeof jobHealth.latestJobFinishedAt === "string" ? jobHealth.latestJobFinishedAt : undefined
  );

  return {
    latestJob: typeof jobHealth.latestJobName === "string" ? jobHealth.latestJobName : "No recent job",
    status: typeof jobHealth.latestJobStatus === "string" ? jobHealth.latestJobStatus : "Unknown",
    startedAt: typeof jobHealth.latestJobStartedAt === "string" ? jobHealth.latestJobStartedAt : "-",
    finishedAt: typeof jobHealth.latestJobFinishedAt === "string" ? jobHealth.latestJobFinishedAt : "-",
    duration,
    failedLast24Hours: typeof jobHealth.failedJobsLast24Hours === "number" ? jobHealth.failedJobsLast24Hours : 0,
  };
}

function computeDuration(startedAt?: string, finishedAt?: string): string {
  if (!startedAt || !finishedAt) return "-";

  try {
    const start = new Date(startedAt);
    const end = new Date(finishedAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "-";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  } catch {
    return "-";
  }
}

function mapActivity(data: Record<string, unknown>): RecentActivityItem[] {
  const rows = Array.isArray(data.recentAuditLogs) ? data.recentAuditLogs : [];

  return rows.filter(isRecord).map((row, index) => ({
    id: typeof row.id === "string" ? row.id : String(index),
    title: typeof row.action === "string" ? row.action : "Admin activity",
    subtitle: typeof row.description === "string" ? row.description : "System",
    occurredAt: typeof row.createdAt === "string" ? row.createdAt : "",
    tone: index % 3 === 0 ? "violet" : index % 3 === 1 ? "blue" : "green",
  }));
}

function mapDashboardSummary(response: unknown): DashboardSummary {
  const data = unwrapEnvelope(response);
  const source = isRecord(data) ? data : {};

  return {
    metrics: mapMetrics(source),
    financial: mapFinancial(),
    aiUsage: mapAiUsage(source),
    bills: mapBills(source),
    jobHealth: mapJobHealth(source),
    recentActivity: mapActivity(source),
  };
}

export async function getDashboardSummaryApi(
  dateFrom?: Date,
  dateTo?: Date
): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (dateFrom) params.set("from", dateFrom.toISOString().split("T")[0]);
  if (dateTo) params.set("to", dateTo.toISOString().split("T")[0]);

  const path =
    params.size > 0
      ? `/api/admin/dashboard/summary?${params.toString()}`
      : "/api/admin/dashboard/summary";

  const response = await requestJson<unknown>(path, {
    method: "GET",
    withAuth: true,
  });

  return mapDashboardSummary(response);
}
