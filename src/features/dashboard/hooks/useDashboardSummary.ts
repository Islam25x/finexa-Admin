import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { getDashboardSummaryApi } from "../api/dashboard.api";

export function useDashboardSummary(dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(dateFrom, dateTo),
    queryFn: () => getDashboardSummaryApi(dateFrom, dateTo),
  });
}
