import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { getAiUsageSummaryApi } from "../api/ai.api";

export function useAiUsageSummary() {
  return useQuery({
    queryKey: queryKeys.ai.usageSummary,
    queryFn: getAiUsageSummaryApi,
  });
}
