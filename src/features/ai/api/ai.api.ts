import { requestJson } from "../../../infrastructure/api/http";
import { unwrapEnvelope } from "../../../shared/utils/api-response.utils";
import type { AiSourceStat, AiUsageSummary } from "../types/ai.types";

const COLORS = [
  "var(--color-primary)",
  "var(--color-primary-hover)",
  "#10b981",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(
  source: Record<string, unknown>,
  key: string,
  fallback = 0,
): number {
  const value = source[key];

  if (typeof value === "number") return value;

  if (typeof value === "string" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return fallback;
}

function readString(
  source: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = source[key];

  return typeof value === "string" ? value : fallback;
}

function mapAiUsageSummary(response: unknown): AiUsageSummary {
  const payload = unwrapEnvelope(response);

  if (!isRecord(payload)) {
    throw new Error("Invalid AI usage response.");
  }

  const totalTransactions = readNumber(payload, "totalTransactions");
  const totalAiTransactions = readNumber(payload, "totalAiTransactions");
  const aiTransactionsAmount = readNumber(payload, "aiTransactionsAmount");

  const rows = Array.isArray(payload.sourceStats)
    ? payload.sourceStats
    : [];

  const sources: AiSourceStat[] = rows
    .filter(isRecord)
    .map((row, index) => ({
      source: readString(row, "source"),
      requests: readNumber(row, "count"),
      amount: readNumber(row, "totalAmount"),
      percent:
        totalAiTransactions === 0
          ? 0
          : (readNumber(row, "count") / totalAiTransactions) * 100,
      color: COLORS[index % COLORS.length],
    }));

  return {
    totalRequests: totalAiTransactions,
    totalAmount: aiTransactionsAmount,
    successRate:
      totalTransactions === 0
        ? 0
        : (totalAiTransactions / totalTransactions) * 100,
    averageCost:
      totalAiTransactions === 0
        ? 0
        : aiTransactionsAmount / totalAiTransactions,
    sources,
  };
}

export async function getAiUsageSummaryApi(): Promise<AiUsageSummary> {
  const response = await requestJson<unknown>(
    "/api/admin/ai/usage-summary",
    {
      method: "GET",
      withAuth: true,
    },
  );

  return mapAiUsageSummary(response);
}