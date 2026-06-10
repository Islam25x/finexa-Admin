export type AiSourceStat = {
  source: string;
  requests: number;
  amount: number;
  percent: number;
  color: string;
};

export type AiUsageSummary = {
  totalRequests: number;
  totalAmount: number;
  successRate: number;
  averageCost: number;
  sources: AiSourceStat[];
};
