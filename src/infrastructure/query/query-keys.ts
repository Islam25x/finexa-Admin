const DASHBOARD_QUERY_KEY = ["dashboard"] as const;
const USERS_QUERY_KEY = ["users"] as const;
const AI_QUERY_KEY = ["ai"] as const;

export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  dashboard: {
    all: DASHBOARD_QUERY_KEY,
    summary: (dateFrom?: Date, dateTo?: Date) => [
      ...DASHBOARD_QUERY_KEY,
      "summary",
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ] as const,
  },
  users: {
    all: USERS_QUERY_KEY,
    list: (params: unknown) => [...USERS_QUERY_KEY, "list", params] as const,
    detail: (id: string) => [...USERS_QUERY_KEY, "detail", id] as const,
  },
  ai: {
    all: AI_QUERY_KEY,
    usageSummary: [...AI_QUERY_KEY, "usage-summary"] as const,
  },
} as const;
